import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PaymentServices } from "./payment.service";

const initiateInitialPayment = catchAsync(
	async (req: Request, res: Response) => {
		const contractId = req.params.id;
		const user = req.user!;

		const result = await PaymentServices.initiateInitialPayment(
			contractId as string,
			user,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Initial Payment (30%) Initiated Successfully",
			data: result,
		});
	},
);

const initiateFinalPayment = catchAsync(async (req: Request, res: Response) => {
	const contractId = req.params.id;
	const user = req.user!;

	const result = await PaymentServices.initiateFinalPayment(
		contractId as string,
		user,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Final Payment (70%) Initiated Successfully",
		data: result,
	});
});

const bkashPaymentCallback = catchAsync(async (req: Request, res: Response) => {
	const payload = { ...req.body, ...req.query };

	const { redirectUrl } = await PaymentServices.bkashPaymentCallback(payload);

	res.redirect(redirectUrl);
});

const getContractPayments = catchAsync(async (req: Request, res: Response) => {
	const contractId = req.params.id;
	const user = req.user!;

	const result = await PaymentServices.getContractPayments(
		contractId as string,
		user,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Payments Fetched Successfully",
		data: result,
	});
});

export const PaymentController = {
	initiateInitialPayment,
	initiateFinalPayment,
	bkashPaymentCallback,
	getContractPayments,
};
