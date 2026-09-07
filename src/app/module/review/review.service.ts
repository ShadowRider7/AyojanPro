import httpStatus from "http-status";
import { ContractStatus, Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import type {
	ICreateReviewPayload,
	IReviewListQuery,
} from "./review.interface";

// ------------------------------------------------------------------
// POST /contracts/:id/reviews
// Either party on a COMPLETED contract may leave exactly one review
// about the other party. Reviewing the professional recalculates
// their averageRating / totalReviews.
// ------------------------------------------------------------------
const createReview = async (
	contractId: string,
	payload: ICreateReviewPayload,
	user: RequestUser,
) => {
	const transactionResult = await prisma.$transaction(async (tx) => {
		const contract = await tx.contract.findUnique({
			where: { id: contractId },
			include: { client: true, professional: true },
		});

		if (!contract) {
			throw new AppError(httpStatus.NOT_FOUND, "Contract Not Found");
		}

		if (contract.status !== ContractStatus.COMPLETED) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Reviews Can Only Be Submitted For Completed Contracts",
			);
		}

		let reviewByClient: boolean;

		if (user.role === Role.CLIENT && contract.client.userId === user.userId) {
			reviewByClient = true;
		} else if (
			user.role === Role.PROFESSIONAL &&
			contract.professional.userId === user.userId
		) {
			reviewByClient = false;
		} else {
			throw new AppError(
				httpStatus.FORBIDDEN,
				"You Are Not A Party To This Contract",
			);
		}

		const existingReview = await tx.review.findUnique({
			where: {
				contractId_clientId_professionalId_reviewByClient: {
					contractId: contract.id,
					clientId: contract.clientId,
					professionalId: contract.professionalId,
					reviewByClient,
				},
			},
		});

		if (existingReview) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"You Have Already Reviewed This Contract",
			);
		}

		const review = await tx.review.create({
			data: {
				contractId: contract.id,
				clientId: contract.clientId,
				professionalId: contract.professionalId,
				reviewByClient,
				rating: payload.rating,
				comment: payload.comment,
			},
		});

		// Only client -> professional reviews feed the professional's
		// public rating aggregate (Client has no equivalent field).
		if (reviewByClient) {
			const aggregates = await tx.review.aggregate({
				where: {
					professionalId: contract.professionalId,
					reviewByClient: true,
				},
				_count: { rating: true },
				_avg: { rating: true },
			});

			await tx.professional.update({
				where: { id: contract.professionalId },
				data: {
					totalReviews: aggregates._count.rating,
					averageRating: aggregates._avg.rating ?? 0,
				},
			});
		}

		return review;
	});

	return transactionResult;
};

// ------------------------------------------------------------------
// GET /professionals/:id/reviews
// Reviews written BY clients ABOUT this professional.
// ------------------------------------------------------------------
const getProfessionalReviews = async (
	professionalId: string,
	query: IReviewListQuery,
) => {
	const page = Number(query.page) > 0 ? Number(query.page) : 1;
	const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
	const skip = (page - 1) * limit;

	const where = { professionalId, reviewByClient: true as const };

	const [data, total] = await Promise.all([
		prisma.review.findMany({
			where,
			skip,
			take: limit,
			orderBy: { createdAt: "desc" },
			include: {
				client: {
					select: {
						id: true,
						city: true,
						user: { select: { name: true, imageUrl: true } },
					},
				},
			},
		}),
		prisma.review.count({ where }),
	]);

	return {
		meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
		data,
	};
};

// ------------------------------------------------------------------
// GET /clients/:id/reviews
// Reviews written BY professionals ABOUT this client.
// ------------------------------------------------------------------
const getClientReviews = async (clientId: string, query: IReviewListQuery) => {
	const page = Number(query.page) > 0 ? Number(query.page) : 1;
	const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
	const skip = (page - 1) * limit;

	const where = { clientId, reviewByClient: false as const };

	const [data, total] = await Promise.all([
		prisma.review.findMany({
			where,
			skip,
			take: limit,
			orderBy: { createdAt: "desc" },
			include: {
				professional: {
					select: {
						id: true,
						name: true,
						professionalTitle: true,
						city: true,
					},
				},
			},
		}),
		prisma.review.count({ where }),
	]);

	return {
		meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
		data,
	};
};

export const ReviewServices = {
	createReview,
	getProfessionalReviews,
	getClientReviews,
};
