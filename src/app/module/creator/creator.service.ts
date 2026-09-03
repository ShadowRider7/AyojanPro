import type { UploadApiResponse } from "cloudinary";
import httpStatus from "http-status";
import { cloudinary } from "../../lib/cloudinary";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import type {
	ICreatePortfolioItemInput,
	ICreateService,
	IUpdateCreatorProfileInput,
	IUpdatePortfolioItemInput,
	IUpdateService,
} from "./creator.interface";

const updateCreatorProfile = async (
	payload: IUpdateCreatorProfileInput,
	user: RequestUser,
) => {
	const existingCreator = await prisma.creator.findUnique({
		where: { userId: user.userId },
	});

	if (!existingCreator) {
		throw new AppError(httpStatus.NOT_FOUND, "Creator Profile Not Found");
	}

	const updatedCreator = await prisma.creator.update({
		where: { id: existingCreator.id },
		data: payload,
	});

	return updatedCreator;
};
const addServices = async (payload: ICreateService, user: RequestUser) => {
	const existingCreator = await prisma.creator.findUnique({
		where: { userId: user.userId },
	});

	if (!existingCreator) {
		throw new AppError(httpStatus.NOT_FOUND, "Creator Profile Not Found");
	}
	const creatorId = existingCreator.id;
	const { name, description } = payload;

	const addedService = await prisma.creatorService.create({
		data: {
			name,
			description,
			creatorId,
		},
		include: {
			creator: true,
		},
	});

	return addedService;
};
const getMyServices = async (user: RequestUser) => {
	const existingCreator = await prisma.creator.findUnique({
		where: { userId: user.userId },
	});

	if (!existingCreator) {
		throw new AppError(httpStatus.NOT_FOUND, "Creator Profile Not Found");
	}

	const myServices = await prisma.creatorService.findMany({
		where: {
			creatorId: existingCreator.id,
		},
	});
	return myServices;
};
const updateService = async (
	payload: IUpdateService,
	serviceId: string,
	user: RequestUser,
) => {
	const existingCreator = await prisma.creator.findUnique({
		where: { userId: user.userId },
	});

	if (!existingCreator) {
		throw new AppError(httpStatus.NOT_FOUND, "Creator Profile Not Found");
	}
	const existingService = await prisma.creatorService.findUnique({
		where: {
			id: serviceId,
		},
	});
	if (!existingService) {
		throw new AppError(httpStatus.NOT_FOUND, "Service not found");
	}
	const { name, description } = payload;
	const updatedService = await prisma.creatorService.update({
		where: {
			id: serviceId,
		},
		data: {
			name,
			description,
		},
	});
	return updatedService;
};
const deleteService = async (serviceId: string, user: RequestUser) => {
	const existingCreator = await prisma.creator.findUnique({
		where: { userId: user.userId },
	});

	if (!existingCreator) {
		throw new AppError(httpStatus.NOT_FOUND, "Creator Profile Not Found");
	}

	const existingService = await prisma.creatorService.findUnique({
		where: {
			id: serviceId,
		},
	});
	if (!existingService) {
		throw new AppError(httpStatus.NOT_FOUND, "Service is already deleted");
	}
	await prisma.creatorService.delete({
		where: {
			id: serviceId,
		},
	});
};

const createPortfolio = async (
	payload: ICreatePortfolioItemInput,
	mediaFile: Express.Multer.File,
	user: RequestUser,
) => {
	const existingCreator = await prisma.creator.findUnique({
		where: { userId: user.userId },
	});

	if (!existingCreator) {
		throw new AppError(httpStatus.NOT_FOUND, "Creator Profile Not Found");
	}

	const mediaUploadResult = await new Promise<UploadApiResponse>(
		(resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{
						resource_type: "auto",
					},

					async (error, result) => {
						if (error) {
							return reject(error);
						}

						if (!result) {
							return reject(
								new AppError(
									httpStatus.INTERNAL_SERVER_ERROR,
									"No result returned from Cloudinary",
								),
							);
						}

						resolve(result);
					},
				)
				.end(mediaFile?.buffer);
		},
	);

	const createdPortfolio = await prisma.portfolioItem.create({
		data: {
			title: payload.title,
			description: payload.description,
			externalUrl: payload.externalUrl,
			thumbnailUrl: payload.thumbnailUrl,
			mediaUrl: mediaUploadResult.secure_url,
			publicId: mediaUploadResult.public_id,
			tools: payload.tools,
			category: payload.category,
			creatorId: existingCreator.id,
		},
		include: {
			creator: true,
		},
	});
	return createdPortfolio;
};

const getMyPortfolioItems = async (user: RequestUser) => {
	const existingCreator = await prisma.creator.findUnique({
		where: { userId: user.userId },
	});

	if (!existingCreator) {
		throw new AppError(httpStatus.NOT_FOUND, "Creator Profile Not Found");
	}

	const myPortfolioItems = await prisma.portfolioItem.findMany({
		where: {
			creatorId: existingCreator.id,
		},
	});
	return myPortfolioItems;
};

const updatePortfolioItem = async (
	payload: IUpdatePortfolioItemInput,
	portfolioId: string,
	user: RequestUser,
) => {
	const existingCreator = await prisma.creator.findUnique({
		where: { userId: user.userId },
	});

	if (!existingCreator) {
		throw new AppError(httpStatus.NOT_FOUND, "Creator Profile Not Found");
	}
	const existingPortfolio = await prisma.portfolioItem.findUnique({
		where: {
			id: portfolioId,
		},
	});
	if (!existingPortfolio) {
		throw new AppError(httpStatus.NOT_FOUND, "Portfolio not found");
	}
	const updatedPortfolio = await prisma.portfolioItem.update({
		where: {
			id: portfolioId,
		},
		data: payload,
	});
	return updatedPortfolio;
};

const deletePortfolio = async (portfolioId: string, user: RequestUser) => {
	const existingCreator = await prisma.creator.findUnique({
		where: { userId: user.userId },
	});

	if (!existingCreator) {
		throw new AppError(httpStatus.NOT_FOUND, "Creator Profile Not Found");
	}
	const existingPortfolio = await prisma.portfolioItem.findUnique({
		where: {
			id: portfolioId,
		},
	});
	if (!existingPortfolio) {
		throw new AppError(httpStatus.NOT_FOUND, "Portfolio is already deleted");
	}

	await prisma.portfolioItem.delete({
		where: {
			id: portfolioId,
		},
	});
};

export const creatorService = {
	updateCreatorProfile,
	addServices,
	getMyServices,
	updateService,
	deleteService,
	createPortfolio,
	getMyPortfolioItems,
	updatePortfolioItem,
	deletePortfolio,
};
