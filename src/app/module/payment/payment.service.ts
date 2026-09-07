import httpStatus from "http-status";
import {
	ContractStatus,
	PaymentMethod,
	PaymentStage,
	PaymentStatus,
	Role,
} from "../../../generated/prisma/enums";
import config from "../../config";
import { getBkashIdToken } from "../../lib/bkash";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import type {
	IBkashCallbackResult,
	IContractPaymentsResult,
	IInitiatePaymentResult,
} from "./payment.interface";

// Contract.agreedAmount is split 30% / 70% between the two payment stages.
const INITIAL_PAYMENT_PERCENTAGE = 0.3;
const FINAL_PAYMENT_PERCENTAGE = 0.7;

// ------------------------------------------------------------------
// Shared helper — creates (or re-creates) a bKash checkout session
// for a given contract + stage and upserts the local Payment row.
// ------------------------------------------------------------------
const initiatePayment = async (
	contractId: string,
	stage: PaymentStage,
	user: RequestUser,
): Promise<IInitiatePaymentResult> => {
	const transactionResult = await prisma.$transaction(async (tx) => {
		const contract = await tx.contract.findUnique({
			where: { id: contractId },
			include: { client: true },
		});

		if (!contract) {
			throw new AppError(httpStatus.NOT_FOUND, "Contract Not Found");
		}

		if (contract.client.userId !== user.userId) {
			throw new AppError(
				httpStatus.FORBIDDEN,
				"You Are Not Authorized To Pay For This Contract",
			);
		}

		if (stage === PaymentStage.INITIAL) {
			if (contract.status !== ContractStatus.PENDING) {
				throw new AppError(
					httpStatus.BAD_REQUEST,
					"Initial Payment Can Only Be Made For A Pending Contract",
				);
			}
		}

		if (stage === PaymentStage.FINAL) {
			if (contract.status !== ContractStatus.DELIVERED) {
				throw new AppError(
					httpStatus.BAD_REQUEST,
					"Final Payment Can Only Be Made After The Contract Is Delivered",
				);
			}

			const initialPayment = await tx.payment.findUnique({
				where: {
					contractId_stage: {
						contractId: contract.id,
						stage: PaymentStage.INITIAL,
					},
				},
			});

			if (
				!initialPayment ||
				initialPayment.status !== PaymentStatus.COMPLETED
			) {
				throw new AppError(
					httpStatus.BAD_REQUEST,
					"Initial Payment Must Be Completed Before The Final Payment",
				);
			}
		}

		const existingPayment = await tx.payment.findUnique({
			where: { contractId_stage: { contractId: contract.id, stage } },
		});

		if (existingPayment?.status === PaymentStatus.PENDING) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				`You Already Have A Pending ${stage} Payment. Please Complete That First`,
			);
		}

		if (existingPayment?.status === PaymentStatus.COMPLETED) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				`The ${stage} Payment Has Already Been Completed For This Contract`,
			);
		}

		const percentage =
			stage === PaymentStage.INITIAL
				? INITIAL_PAYMENT_PERCENTAGE
				: FINAL_PAYMENT_PERCENTAGE;

		const amount = (Number(contract.agreedAmount) * percentage).toFixed(2);

		const bkashIdToken = await getBkashIdToken();

		if (!bkashIdToken) {
			throw new AppError(
				httpStatus.BAD_GATEWAY,
				"No Bkash Access Token Found!",
			);
		}

		// e.g. "5f2c...contractId-INITIAL" — kept unique per contract + stage
		const merchantInvoiceNumber = `${contract.id}-${stage}`;

		const bkashCreatePaymentResponse = await fetch(
			`${config.bkash_base_url}/tokenized/checkout/create`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					Authorization: bkashIdToken,
					"X-App-Key": config.bkash_app_key,
				},
				body: JSON.stringify({
					mode: "0011",
					payerReference: user.email,
					callbackURL: `${config.bkash_callback_url}/payments/bkash/callback`,
					amount,
					currency: "BDT",
					intent: "sale",
					merchantInvoiceNumber,
				}),
			},
		);

		const bkashCreatePaymentResult = await bkashCreatePaymentResponse.json();

		if (existingPayment) {
			await tx.payment.update({
				where: { id: existingPayment.id },
				data: {
					status: PaymentStatus.PENDING,
					method: PaymentMethod.BKASH,
					amount,
					currency: contract.currency,
					merchantInvoiceNumber: bkashCreatePaymentResult.merchantInvoiceNumber,
					bkashPaymentId: bkashCreatePaymentResult.paymentID,
					payerReference: user.email,
					failureReason: null,
					metadata: bkashCreatePaymentResult,
				},
			});
		} else {
			await tx.payment.create({
				data: {
					contractId: contract.id,
					clientId: contract.clientId,
					stage,
					status: PaymentStatus.PENDING,
					method: PaymentMethod.BKASH,
					amount,
					currency: contract.currency,
					merchantInvoiceNumber: bkashCreatePaymentResult.merchantInvoiceNumber,
					bkashPaymentId: bkashCreatePaymentResult.paymentID,
					payerReference: user.email,
					metadata: bkashCreatePaymentResult,
				},
			});
		}

		return {
			paymentUrl: bkashCreatePaymentResult.bkashURL,
		};
	});

	return transactionResult;
};

const initiateInitialPayment = async (
	contractId: string,
	user: RequestUser,
): Promise<IInitiatePaymentResult> => {
	return initiatePayment(contractId, PaymentStage.INITIAL, user);
};

const initiateFinalPayment = async (
	contractId: string,
	user: RequestUser,
): Promise<IInitiatePaymentResult> => {
	return initiatePayment(contractId, PaymentStage.FINAL, user);
};

// ------------------------------------------------------------------
// bKash callback — verifies the payment server-side via the execute
// endpoint (never trusts the query/body status blindly) and updates
// the Payment + Contract rows accordingly.
// ------------------------------------------------------------------
const bkashPaymentCallback = async (
	query: Record<string, any>,
): Promise<IBkashCallbackResult> => {
	const transactionResult = await prisma.$transaction(
		async (tx) => {
			const paymentId = query.paymentID;

			if (!paymentId) {
				throw new AppError(httpStatus.BAD_REQUEST, "Payment Id Missing");
			}

			const status = query.status;

			if (!status) {
				throw new AppError(httpStatus.BAD_REQUEST, "Payment Status Is Missing");
			}

			const payment = await tx.payment.findUnique({
				where: { bkashPaymentId: paymentId },
			});

			if (!payment) {
				throw new AppError(httpStatus.NOT_FOUND, "Payment Not Found");
			}

			const bkashIdToken = await getBkashIdToken();

			if (!bkashIdToken) {
				throw new AppError(
					httpStatus.BAD_GATEWAY,
					"No Bkash Access Token Found!",
				);
			}

			// Always verify with bKash directly — the redirect status alone
			// is not trusted.
			const executedPaymentResponse = await fetch(
				`${config.bkash_base_url}/tokenized/checkout/execute`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
						Authorization: bkashIdToken,
						"X-App-Key": config.bkash_app_key,
					},
					body: JSON.stringify({ paymentID: paymentId }),
				},
			);

			const executedPaymentResult = await executedPaymentResponse.json();

			if (status === "success") {
				await tx.payment.update({
					where: { id: payment.id },
					data: {
						status: PaymentStatus.COMPLETED,
						bkashTransactionId: executedPaymentResult.trxID,
						transactionTime: executedPaymentResult.paymentExecuteTime
							? new Date(executedPaymentResult.paymentExecuteTime)
							: new Date(),
						paidAt: new Date(),
						metadata: executedPaymentResult,
					},
				});

				const isInitialStage = payment.stage === PaymentStage.INITIAL;

				await tx.contract.update({
					where: { id: payment.contractId },
					data: {
						status: isInitialStage
							? ContractStatus.CONFIRMED
							: ContractStatus.COMPLETED,
						...(isInitialStage
							? { confirmedAt: new Date() }
							: { completedAt: new Date() }),
					},
				});

				return {
					redirectUrl: `${config.frontend_url}/dashboard/contracts/${payment.contractId}?payment=success`,
				};
			}

			if (status === "failure") {
				await tx.payment.update({
					where: { id: payment.id },
					data: {
						status: PaymentStatus.FAILED,
						failureReason:
							executedPaymentResult.statusMessage ?? "Payment Failed",
						metadata: executedPaymentResult,
					},
				});

				return {
					redirectUrl: `${config.frontend_url}/dashboard/contracts/${payment.contractId}?payment=failure`,
				};
			}

			if (status === "cancel") {
				await tx.payment.update({
					where: { id: payment.id },
					data: {
						status: PaymentStatus.CANCELLED,
						metadata: executedPaymentResult,
					},
				});

				return {
					redirectUrl: `${config.frontend_url}/dashboard/contracts/${payment.contractId}?payment=cancel`,
				};
			}

			return {
				redirectUrl: `${config.frontend_url}/dashboard/contracts/${payment.contractId}?payment=error`,
			};
		},
		{
			maxWait: 10000, // default: 2000
			timeout: 30000, // default: 5000
		},
	);

	return transactionResult;
};

// ------------------------------------------------------------------
// GET /contracts/:id/payments
// ------------------------------------------------------------------
const getContractPayments = async (
	contractId: string,
	user: RequestUser,
): Promise<IContractPaymentsResult> => {
	const contract = await prisma.contract.findUnique({
		where: { id: contractId },
		include: { client: true, professional: true },
	});

	if (!contract) {
		throw new AppError(httpStatus.NOT_FOUND, "Contract Not Found");
	}

	const isClient = contract.client.userId === user.userId;
	const isProfessional = contract.professional.userId === user.userId;
	const isAdmin = user.role === Role.ADMIN;

	if (!isClient && !isProfessional && !isAdmin) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You Are Not Authorized To View Payments For This Contract",
		);
	}

	const payments = await prisma.payment.findMany({
		where: { contractId },
		orderBy: { createdAt: "asc" },
	});

	return payments;
};

export const PaymentServices = {
	initiateInitialPayment,
	initiateFinalPayment,
	bkashPaymentCallback,
	getContractPayments,
};
