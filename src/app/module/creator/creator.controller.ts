import type { Request, Response } from "express";
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { creatorService } from "./creator.service";
import { CreatorValidation } from "./creator.validation";

const updateCreatorProfile = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const user = req.user!;

	const result = await creatorService.updateCreatorProfile(payload, user);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Creator Profile Updated Successfully",
		data: result,
	});
});

const addServices = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const user = req.user!;

	const result = await creatorService.addServices(payload, user);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Service added Successfully",
		data: result,
	});
});
const getMyServices = catchAsync(async (req: Request, res: Response) => {
	const user = req.user!;

	const result = await creatorService.getMyServices(user);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "My service list fetched Successfully",
		data: result,
	});
});

const updateService = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const serviceId = req.params.id;
	const user = req.user!;
	const result = await creatorService.updateService(
		payload,
		serviceId as string,
		user,
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "service updated Successfully",
		data: result,
	});
});

const deleteService = catchAsync(async (req: Request, res: Response) => {
	const serviceId = req.params.id;
	const user = req.user!;
	await creatorService.deleteService(serviceId as string, user);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "service deleted Successfully",
		data: null,
	});
});
const createPortfolio = catchAsync(async (req: Request, res: Response) => {
	const files = req.files as { [fieldname: string]: Express.Multer.File[] };
	const mediaFile = files?.["mediaFile"] ? files["mediaFile"][0] : null;

	if (!mediaFile) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Portfolio media file is required",
		);
	}

	if (!req.body.data) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Form payload 'data' is missing",
		);
	}

	const zodValidationResult = CreatorValidation.CreatePortfolioSchema.safeParse(
		JSON.parse(req.body.data),
	);

	if (!zodValidationResult.success) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			zodValidationResult.error.issues[0].message,
		);
	}

	const payload = zodValidationResult.data;
	const user = req.user!;

	const result = await creatorService.createPortfolio(payload, mediaFile, user);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Portfolio item added successfully",
		data: result,
	});
});
const getMyPortfolioItems = catchAsync(async (req: Request, res: Response) => {
	const user = req.user!;

	const result = await creatorService.getMyPortfolioItems(user);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "My portfolio list fetched Successfully",
		data: result,
	});
});
const updatePortfolioItem = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const portfolioId = req.params.id;
	const user = req.user!;
	const result = await creatorService.updatePortfolioItem(
		payload,
		portfolioId as string,
		user,
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Portfolio updated Successfully",
		data: result,
	});
});
const deletePortfolio = catchAsync(async (req: Request, res: Response) => {
	const portfolioId = req.params.id;
	const user = req.user!;
	await creatorService.deletePortfolio(portfolioId as string, user);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "portfolio deleted Successfully",
		data: null,
	});
});
export const creatorController = {
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
