import httpStatus from "http-status";
import {
	DisputeRaisedBy,
	DisputeStatus,
	Role,
} from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import type {
	IRaiseDispute,
	IUpdateDisputeStatus,
	IUploadEvidence,
} from "./dispute.interface";

const DISPUTE_INCLUDE = {
	contract: {
		include: { client: true, professional: true },
	},
	raisedBy: true,
	resolvedBy: true,
	evidences: { include: { uploadedBy: true } },
} as const;

const TERMINAL_STATUSES = new Set<DisputeStatus>([
	DisputeStatus.RESOLVED,
	DisputeStatus.REJECTED,
	DisputeStatus.CLOSED,
]);

/**
 * Loads a dispute and confirms the requester is the contract's client, the
 * contract's professional, or an admin. Throws otherwise.
 */
const getAuthorizedDispute = async (disputeId: string, user: RequestUser) => {
	const dispute = await prisma.dispute.findUnique({
		where: { id: disputeId },
		include: DISPUTE_INCLUDE,
	});

	if (!dispute) {
		throw new AppError(httpStatus.NOT_FOUND, "Dispute Not Found");
	}

	if (user.role === Role.ADMIN) return dispute;

	const { client, professional } = dispute.contract;
	const isParty =
		(user.role === Role.CLIENT && client.userId === user.userId) ||
		(user.role === Role.PROFESSIONAL && professional.userId === user.userId);

	if (!isParty) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You do not have access to this dispute",
		);
	}

	return dispute;
};

/**
 * Raises a dispute on a contract. Only the client or professional on the
 * contract may do this, and only one active (OPEN/UNDER_REVIEW) dispute is
 * allowed per contract at a time. Raising a dispute freezes the contract
 * by moving it to DISPUTED.
 */
const raiseDispute = async (
	contractId: string,
	payload: IRaiseDispute,
	user: RequestUser,
) => {
	const contract = await prisma.contract.findUnique({
		where: { id: contractId },
		include: { client: true, professional: true, disputes: true },
	});

	if (!contract) {
		throw new AppError(httpStatus.NOT_FOUND, "Contract Not Found");
	}

	let raisedByRole: DisputeRaisedBy;

	if (user.role === Role.CLIENT && contract.client.userId === user.userId) {
		raisedByRole = DisputeRaisedBy.CLIENT;
	} else if (
		user.role === Role.PROFESSIONAL &&
		contract.professional.userId === user.userId
	) {
		raisedByRole = DisputeRaisedBy.PROFESSIONAL;
	} else {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Only the client or professional on this contract can raise a dispute",
		);
	}

	if (contract.status === "CANCELLED") {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Cannot raise a dispute on a cancelled contract",
		);
	}

	const alreadyActive = contract.disputes.some(
		(d) =>
			d.status === DisputeStatus.OPEN ||
			d.status === DisputeStatus.UNDER_REVIEW,
	);

	if (alreadyActive) {
		throw new AppError(
			httpStatus.CONFLICT,
			"This contract already has an active dispute",
		);
	}

	const dispute = await prisma.$transaction(async (tx) => {
		const created = await tx.dispute.create({
			data: {
				contractId,
				raisedById: user.userId,
				raisedByRole,
				reason: payload.reason,
				description: payload.description,
			},
			include: DISPUTE_INCLUDE,
		});

		// Freeze the contract while the dispute is being looked into.
		await tx.contract.update({
			where: { id: contractId },
			data: { status: "DISPUTED" },
		});

		return created;
	});

	return dispute;
};

const listDisputes = async (
	user: RequestUser,
	filters: { status?: DisputeStatus },
) => {
	if (user.role !== Role.ADMIN) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Only admins can list all disputes",
		);
	}

	return prisma.dispute.findMany({
		where: filters.status ? { status: filters.status } : undefined,
		include: DISPUTE_INCLUDE,
		orderBy: { createdAt: "desc" },
	});
};

const getDisputeDetails = async (disputeId: string, user: RequestUser) => {
	return getAuthorizedDispute(disputeId, user);
};

/**
 * Either party on the contract (or admin) can add evidence, but only while
 * the dispute is still active — not after it's been resolved/rejected/closed.
 */
const uploadEvidence = async (
	disputeId: string,
	payload: IUploadEvidence,
	user: RequestUser,
) => {
	const dispute = await getAuthorizedDispute(disputeId, user);

	if (TERMINAL_STATUSES.has(dispute.status)) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`Cannot add evidence to a dispute that is already ${dispute.status.toLowerCase()}`,
		);
	}

	return prisma.disputeEvidence.create({
		data: {
			disputeId,
			uploadedById: user.userId,
			type: payload.type,
			title: payload.title,
			description: payload.description,
			mediaUrl: payload.mediaUrl,
		},
	});
};

/**
 * Admin-only non-resolving status transitions (OPEN, UNDER_REVIEW,
 * REJECTED, CLOSED). RESOLVED is handled separately by resolveDispute,
 * since it also records the resolution text and updates the contract.
 *
 * NOTE: rejecting or closing a dispute currently reverts the contract to
 * IN_PROGRESS as a reasonable default, since the schema doesn't retain the
 * contract's pre-dispute status. If contracts frequently get disputed
 * before ever starting, consider adding a `statusBeforeDispute` field to
 * Contract so this can restore the exact prior state instead.
 */
const updateDisputeStatus = async (
	disputeId: string,
	payload: IUpdateDisputeStatus,
	user: RequestUser,
) => {
	if (user.role !== Role.ADMIN) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Only admins can update dispute status",
		);
	}

	const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });

	if (!dispute) {
		throw new AppError(httpStatus.NOT_FOUND, "Dispute Not Found");
	}

	if (TERMINAL_STATUSES.has(dispute.status)) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`This dispute is already ${dispute.status.toLowerCase()} and cannot be changed`,
		);
	}

	return prisma.$transaction(async (tx) => {
		const updated = await tx.dispute.update({
			where: { id: disputeId },
			data: { status: payload.status },
		});

		if (payload.status === "REJECTED" || payload.status === "CLOSED") {
			await tx.contract.updateMany({
				where: { id: dispute.contractId, status: "DISPUTED" },
				data: { status: "IN_PROGRESS" },
			});
		}

		return updated;
	});
};

/**
 * Admin resolves a dispute: records the resolution, closes the dispute out,
 * and moves the contract to RESOLVED (a terminal-ish state distinct from
 * COMPLETED/CANCELLED, per the ContractStatus enum).
 */
const resolveDispute = async (
	disputeId: string,
	resolution: string,
	user: RequestUser,
) => {
	if (user.role !== Role.ADMIN) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Only admins can resolve disputes",
		);
	}

	const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });

	if (!dispute) {
		throw new AppError(httpStatus.NOT_FOUND, "Dispute Not Found");
	}

	if (TERMINAL_STATUSES.has(dispute.status)) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`This dispute is already ${dispute.status.toLowerCase()}`,
		);
	}

	return prisma.$transaction(async (tx) => {
		const resolved = await tx.dispute.update({
			where: { id: disputeId },
			data: {
				status: "RESOLVED",
				resolution,
				resolvedById: user.userId,
				resolvedAt: new Date(),
			},
		});

		await tx.contract.update({
			where: { id: dispute.contractId },
			data: { status: "RESOLVED" },
		});

		return resolved;
	});
};

export const disputeService = {
	raiseDispute,
	listDisputes,
	getDisputeDetails,
	uploadEvidence,
	updateDisputeStatus,
	resolveDispute,
};
