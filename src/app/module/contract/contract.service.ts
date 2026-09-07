import httpStatus from "http-status";
import { ContractStatus, Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import type { IAttachDeliverable } from "./contract.interface";

const CONTRACT_INCLUDE = {
	client: true,
	professional: true,
	event: true,
	eventServiceRequirement: true,
	professionalService: true,
	proposalItem: true,
	payments: true,
	deliverables: true,
} as const;

/**
 * Loads a contract and confirms the requesting user is the client on it,
 * the professional on it, or an admin. Throws otherwise.
 */
const getAuthorizedContract = async (contractId: string, user: RequestUser) => {
	const contract = await prisma.contract.findUnique({
		where: { id: contractId },
		include: CONTRACT_INCLUDE,
	});

	if (!contract) {
		throw new AppError(httpStatus.NOT_FOUND, "Contract Not Found");
	}

	if (user.role === Role.ADMIN) {
		return contract;
	}

	if (user.role === Role.CLIENT && contract.client.userId === user.userId) {
		return contract;
	}

	if (
		user.role === Role.PROFESSIONAL &&
		contract.professional.userId === user.userId
	) {
		return contract;
	}

	throw new AppError(
		httpStatus.FORBIDDEN,
		"You do not have access to this contract",
	);
};

const listContracts = async (user: RequestUser) => {
	if (user.role === Role.CLIENT) {
		const client = await prisma.client.findUnique({
			where: { userId: user.userId },
		});
		if (!client)
			throw new AppError(httpStatus.NOT_FOUND, "Client Profile Not Found");

		return prisma.contract.findMany({
			where: { clientId: client.id },
			include: CONTRACT_INCLUDE,
			orderBy: { createdAt: "desc" },
		});
	}

	if (user.role === Role.PROFESSIONAL) {
		const professional = await prisma.professional.findUnique({
			where: { userId: user.userId },
		});
		if (!professional)
			throw new AppError(
				httpStatus.NOT_FOUND,
				"Professional Profile Not Found",
			);

		return prisma.contract.findMany({
			where: { professionalId: professional.id },
			include: CONTRACT_INCLUDE,
			orderBy: { createdAt: "desc" },
		});
	}

	// ADMIN sees everything.
	return prisma.contract.findMany({
		include: CONTRACT_INCLUDE,
		orderBy: { createdAt: "desc" },
	});
};

const getContractDetails = async (contractId: string, user: RequestUser) => {
	return getAuthorizedContract(contractId, user);
};

const CANCELLABLE_STATUSES = new Set(["PENDING", "CONFIRMED", "IN_PROGRESS"]);

const cancelContract = async (
	contractId: string,
	reason: string | undefined,
	user: RequestUser,
) => {
	const contract = await getAuthorizedContract(contractId, user);

	if (!CANCELLABLE_STATUSES.has(contract.status)) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`A contract in status ${contract.status} cannot be cancelled`,
		);
	}

	const updated = await prisma.$transaction(async (tx) => {
		const cancelled = await tx.contract.update({
			where: { id: contractId },
			data: {
				status: ContractStatus.CANCELLED,
				cancelledAt: new Date(),
				cancellationReason: reason,
			},
		});

		// Cancelling frees the professional's schedule and re-opens the
		// requirement for other proposals (see requirements doc §28).
		await tx.eventServiceRequirement.update({
			where: { id: contract.eventServiceRequirementId },
			data: { status: "OPEN" },
		});

		return cancelled;
	});

	return updated;
};

const attachDeliverable = async (
	contractId: string,
	payload: IAttachDeliverable,
	user: RequestUser,
) => {
	const contract = await getAuthorizedContract(contractId, user);

	if (
		user.role !== Role.PROFESSIONAL ||
		contract.professional.userId !== user.userId
	) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Only the assigned professional can submit a deliverable",
		);
	}

	if (contract.status !== ContractStatus.CONFIRMED && contract.status !== ContractStatus.IN_PROGRESS) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Deliverables can only be submitted while the contract is confirmed or in progress",
		);
	}

	if (!payload.externalUrl || payload.externalUrl.length === 0) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"At least one deliverable link is required",
		);
	}

	const result = await prisma.$transaction(async (tx) => {
		const deliverable = await tx.deliverable.upsert({
			where: { contractId },
			create: {
				contractId,
				title: payload.title,
				description: payload.description,
				externalUrl: payload.externalUrl,
			},
			update: {
				title: payload.title,
				description: payload.description,
				externalUrl: payload.externalUrl,
			},
		});

		const updatedContract = await tx.contract.update({
			where: { id: contractId },
			data: { status: "DELIVERED" },
		});

		return { deliverable, contract: updatedContract };
	});

	return result;
};

const getDeliverable = async (contractId: string, user: RequestUser) => {
	await getAuthorizedContract(contractId, user);

	const deliverable = await prisma.deliverable.findUnique({
		where: { contractId },
	});

	// Deliberately returns null rather than 404 — the caller asked for
	// "the deliverable, if any."
	return deliverable;
};

/**
 * Shared completion logic — called from the manual PATCH endpoint below
 * AND from the bKash callback handler once the final payment is verified
 * COMPLETED, so both paths stay in sync.
 */
const markContractCompleted = async (contractId: string) => {
	return prisma.$transaction(async (tx) => {
		const contract = await tx.contract.update({
			where: { id: contractId },
			data: { status: ContractStatus.COMPLETED, completedAt: new Date() },
		});

		await tx.eventServiceRequirement.update({
			where: { id: contract.eventServiceRequirementId },
			data: { status: "COMPLETED" },
		});

		return contract;
	});
};

const completeContract = async (contractId: string, user: RequestUser) => {
	const contract = await getAuthorizedContract(contractId, user);

	if (contract.status !== ContractStatus.DELIVERED) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Contract must be DELIVERED before it can be marked completed",
		);
	}

	const finalPaymentCompleted = contract.payments.some(
		(p) => p.stage === "FINAL" && p.status === "COMPLETED",
	);

	if (!finalPaymentCompleted) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Final payment must be completed before the contract can be marked completed",
		);
	}

	return markContractCompleted(contractId);
};

export const contractService = {
	listContracts,
	getContractDetails,
	cancelContract,
	attachDeliverable,
	getDeliverable,
	completeContract,
	markContractCompleted,
};
