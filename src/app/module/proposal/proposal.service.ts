import httpStatus from "http-status";
import { ProposalStatus, Role, ServiceRequirementStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import type { ICreateProposal } from "./proposal.interface";

/**
 * Creates one Proposal for an event, containing one ProposalItem per
 * (eventServiceRequirementId, professionalServiceId) pair the professional
 * is submitting for. This lets a professional propose for multiple
 * requirements of the same event in a single submission.
 */
const createProposal = async (
	eventId: string,
	payload: ICreateProposal,
	user: RequestUser,
) => {
	const existingProfessional = await prisma.professional.findUnique({
		where: { userId: user.userId },
	});

	if (!existingProfessional) {
		throw new AppError(httpStatus.NOT_FOUND, "Professional Profile Not Found");
	}

	const event = await prisma.event.findUnique({
		where: { id: eventId },
	});

	if (!event || event.isDeleted) {
		throw new AppError(httpStatus.NOT_FOUND, "Event Not Found");
	}

	const { items, message } = payload;

	if (!items || items.length === 0) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"At least one proposal item is required",
		);
	}

	const requirementIds = items.map((item) => item.eventServiceRequirementId);
	const uniqueRequirementIds = new Set(requirementIds);

	if (uniqueRequirementIds.size !== requirementIds.length) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Cannot submit the same service requirement twice in one proposal",
		);
	}

	const requirements = await prisma.eventServiceRequirement.findMany({
		where: { id: { in: requirementIds }, eventId, isDeleted: false },
	});

	if (requirements.length !== uniqueRequirementIds.size) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"One or more service requirements were not found on this event",
		);
	}

	const closedRequirements = requirements.filter(
		(r) => r.status !== "OPEN" && r.status !== "PARTIALLY_FILLED",
	);

	if (closedRequirements.length > 0) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"One or more service requirements are no longer accepting proposals",
		);
	}

	const professionalServiceIds = items.map(
		(item) => item.professionalServiceId,
	);
	const uniqueProfessionalServiceIds = new Set(professionalServiceIds);

	const ownedServices = await prisma.professionalService.findMany({
		where: {
			id: { in: professionalServiceIds },
			professionalId: existingProfessional.id,
		},
	});

	if (ownedServices.length !== uniqueProfessionalServiceIds.size) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"One or more services do not belong to you",
		);
	}

	const existingActiveItem = await prisma.proposalItem.findFirst({
		where: {
			eventServiceRequirementId: { in: requirementIds },
			proposal: { professionalId: existingProfessional.id },
			status: { in: [ProposalStatus.PENDING, ProposalStatus.ACCEPTED] },
		},
	});

	if (existingActiveItem) {
		throw new AppError(
			httpStatus.CONFLICT,
			"You already have an active proposal item for one of these requirements",
		);
	}

	const proposal = await prisma.proposal.create({
		data: {
			eventId,
			professionalId: existingProfessional.id,
			message,
			items: {
				create: items.map((item) => ({
					eventServiceRequirementId: item.eventServiceRequirementId,
					professionalServiceId: item.professionalServiceId,
					proposedAmount: item.proposedAmount,
					currency: item.currency ?? "BDT",
					proposedStartAt: item.proposedStartAt,
					proposedEndAt: item.proposedEndAt,
				})),
			},
		},
		include: {
			items: {
				include: {
					eventServiceRequirement: true,
					professionalService: true,
				},
			},
		},
	});

	return proposal;
};

const getProposals = async (requirementId: string, user: RequestUser) => {
	const existingUser = await prisma.user.findUnique({
		where: { id: user.userId },
	});
	const allowedRoles = new Set<Role>([Role.ADMIN, Role.CLIENT]);

	if (!existingUser || !allowedRoles.has(existingUser.role)) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"You don't have permission to get the proposals",
		);
	}

	const proposals = await prisma.proposal.findMany({
		where: {
			items: {
				some: { eventServiceRequirementId: requirementId },
			},
		},
		include: {
			professional: true,
			items: {
				where: { eventServiceRequirementId: requirementId },
				include: {
					eventServiceRequirement: true,
					professionalService: true,
				},
			},
		},
	});

	return proposals;
};

const getProposalDetails = async (proposalId: string) => {
	const proposal = await prisma.proposal.findUnique({
		where: { id: proposalId },
		include: {
			professional: true,
			event: true,
			items: {
				include: {
					eventServiceRequirement: true,
					professionalService: true,
					contract: true,
				},
			},
		},
	});

	if (!proposal) {
		throw new AppError(httpStatus.NOT_FOUND, "Proposal Not Found");
	}

	return proposal;
};

/**
 * Fetches a ProposalItem plus everything needed to authorize and act on it:
 * the owning proposal (professional), the requirement + its event (client),
 * and the professional service.
 */
const getItemWithContext = async (itemId: string) => {
	const item = await prisma.proposalItem.findUnique({
		where: { id: itemId },
		include: {
			proposal: { include: { professional: true } },
			eventServiceRequirement: {
				include: { event: { include: { client: true } } },
			},
			professionalService: true,
		},
	});

	if (!item) {
		throw new AppError(httpStatus.NOT_FOUND, "Proposal Item Not Found");
	}

	return item;
};

/**
 * Client accepts one ProposalItem → creates the Contract for that
 * requirement, auto-rejects every other PENDING item competing for the
 * same requirement, and marks the requirement FILLED.
 *
 * Race-safety: the requirement is flipped to FILLED via a conditional
 * `updateMany` inside the transaction. If another accept beat this one to
 * it, the affected-row count will be 0 and we abort with a conflict
 * instead of creating a duplicate contract.
 */
const acceptProposalItem = async (itemId: string, user: RequestUser) => {
	const client = await prisma.client.findUnique({
		where: { userId: user.userId },
	});

	if (!client) {
		throw new AppError(httpStatus.NOT_FOUND, "Client Profile Not Found");
	}

	const item = await getItemWithContext(itemId);
	const requirement = item.eventServiceRequirement;
	const event = requirement.event;

	if (event.clientId !== client.id) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You do not own the event this requirement belongs to",
		);
	}

	if (item.status !== ProposalStatus.PENDING) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`This proposal item is already ${item.status.toLowerCase()}`,
		);
	}

	if (
		requirement.status !== ServiceRequirementStatus.OPEN &&
		requirement.status !== ServiceRequirementStatus.PARTIALLY_FILLED
	) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"This service requirement is no longer open",
		);
	}

	const professional = item.proposal.professional;

	if (!professional.acceptingBookings) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"This professional is not currently accepting bookings",
		);
	}

	// Schedule conflict check: the professional cannot already be committed
	// to an overlapping confirmed/in-progress contract elsewhere.
	const conflict = await prisma.contract.findFirst({
		where: {
			professionalId: professional.id,
			status: { in: ["CONFIRMED", "IN_PROGRESS"] },
			serviceStartAt: { lt: item.proposedEndAt },
			serviceEndAt: { gt: item.proposedStartAt },
		},
	});

	if (conflict) {
		throw new AppError(
			httpStatus.CONFLICT,
			"This professional already has an overlapping contract during the proposed time",
		);
	}

	const contract = await prisma.$transaction(async (tx) => {
		// Conditional flip: only succeeds if the requirement is still open.
		const { count } = await tx.eventServiceRequirement.updateMany({
			where: {
				id: requirement.id,
				status: { in: [ServiceRequirementStatus.OPEN, ServiceRequirementStatus.PARTIALLY_FILLED] },
			},
			data: { status: ServiceRequirementStatus.FILLED },
		});

		if (count === 0) {
			throw new AppError(
				httpStatus.CONFLICT,
				"This requirement was just filled by another proposal",
			);
		}

		await tx.proposalItem.update({
			where: { id: item.id },
			data: { status: ProposalStatus.ACCEPTED, respondedAt: new Date() },
		});

		// Every other still-pending item competing for this requirement is
		// auto-rejected — the requirement is now spoken for.
		await tx.proposalItem.updateMany({
			where: {
				eventServiceRequirementId: requirement.id,
				id: { not: item.id },
				status: ProposalStatus.PENDING,
			},
			data: { status: ProposalStatus.REJECTED, respondedAt: new Date() },
		});

		return tx.contract.create({
			data: {
				clientId: client.id,
				professionalId: professional.id,
				eventId: event.id,
				eventServiceRequirementId: requirement.id,
				professionalServiceId: item.professionalServiceId,
				proposalItemId: item.id,
				agreedAmount: item.proposedAmount,
				currency: item.currency,
				serviceStartAt: item.proposedStartAt,
				serviceEndAt: item.proposedEndAt,
			},
			include: {
				client: true,
				professional: true,
				event: true,
				eventServiceRequirement: true,
				professionalService: true,
			},
		});
	});

	return contract;
};

const rejectProposalItem = async (itemId: string, user: RequestUser) => {
	const client = await prisma.client.findUnique({
		where: { userId: user.userId },
	});

	if (!client) {
		throw new AppError(httpStatus.NOT_FOUND, "Client Profile Not Found");
	}

	const item = await getItemWithContext(itemId);
	const event = item.eventServiceRequirement.event;

	if (event.clientId !== client.id) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You do not own the event this requirement belongs to",
		);
	}

	if (item.status !== ProposalStatus.PENDING) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`This proposal item is already ${item.status.toLowerCase()}`,
		);
	}

	const updated = await prisma.proposalItem.update({
		where: { id: item.id },
		data: { status: ProposalStatus.REJECTED, respondedAt: new Date() },
	});

	return updated;
};

const withdrawProposalItem = async (itemId: string, user: RequestUser) => {
	const professional = await prisma.professional.findUnique({
		where: { userId: user.userId },
	});

	if (!professional) {
		throw new AppError(httpStatus.NOT_FOUND, "Professional Profile Not Found");
	}

	const item = await getItemWithContext(itemId);

	if (item.proposal.professionalId !== professional.id) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You do not own this proposal item",
		);
	}

	if (item.status !== ProposalStatus.PENDING) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`This proposal item is already ${item.status.toLowerCase()}`,
		);
	}

	const updated = await prisma.proposalItem.update({
		where: { id: item.id },
		data: { status: ProposalStatus.WITHDRAWN, respondedAt: new Date() },
	});

	return updated;
};

export const proposalService = {
	createProposal,
	getProposals,
	getProposalDetails,
	acceptProposalItem,
	rejectProposalItem,
	withdrawProposalItem,
};
