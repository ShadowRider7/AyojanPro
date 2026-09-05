import type { Request, Response } from "express";
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { professionalService } from "./professional.service";
import { ProfessionalValidation } from "./professional.validation";

const applyAsProfessional = catchAsync(async (req: Request, res: Response) => {
	const files = req.files as { [fieldname: string]: Express.Multer.File[] };
	console.log({ files });
	const resume = files?.["resume"] ? files["resume"][0] : null;
	const additionalFiles = files?.["additionalFiles"] || [];

	const zodValidationResult =
		ProfessionalValidation.applyAsProfessionalSchema.safeParse(
			JSON.parse(req.body.data),
		);

	if (!zodValidationResult.success) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			zodValidationResult.error.issues[0].message,
		);
	}

	const payload = zodValidationResult.data;

	const result = await professionalService.applyAsProfessional(
		payload,
		resume,
		additionalFiles,
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Applied As professional Successfully",
		data: result,
	});
});
const verifyProfessionalEmail = catchAsync(
	async (req: Request, res: Response) => {
		const payload = req.body;

		const result = await professionalService.verifyProfessionalEmail(payload);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "professional Email Verified Successfully",
			data: result,
		});
	},
);

const approveProfessional = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const user = req.user!;

	const result = await professionalService.approveProfessional(payload, user);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Professional user account is approved Successfully",
		data: result,
	});
});

const getAllProfessionals = catchAsync(async (req: Request, res: Response) => {
	const { data, meta } = await professionalService.getAllProfessionals(
		req.query,
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Professionals Retrieved Successfully",
		data: data,
		meta: meta,
	});
});

const getAllProfessionalListPublic = catchAsync(
	async (req: Request, res: Response) => {
		const { data, meta } =
			await professionalService.getAllProfessionalListPublic(req.query);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "professionals Retrieved Successfully",
			data,
			meta,
		});
	},
);

const getSingleProfessionalPublicProfile = catchAsync(
	async (req: Request, res: Response) => {
		const professionalId = req.params.professionalId as string;

		const result =
			await professionalService.getSingleProfessionalPublicProfile(
				professionalId,
			);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "professional Profile Retrieved Successfully",
			data: result,
		});
	},
);

const updateProfessionalProfile = catchAsync(
	async (req: Request, res: Response) => {
		const payload = req.body;
		const user = req.user!;

		const result = await professionalService.updateProfessionalProfile(
			payload,
			user,
		);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Professional Profile Updated Successfully",
			data: result,
		});
	},
);

const addServices = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const user = req.user!;

	const result = await professionalService.addServices(payload, user);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Service added Successfully",
		data: result,
	});
});
const getMyServices = catchAsync(async (req: Request, res: Response) => {
	const user = req.user!;

	const result = await professionalService.getMyServices(user);
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
	const result = await professionalService.updateService(
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
	await professionalService.deleteService(serviceId as string, user);
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

	const zodValidationResult =
		ProfessionalValidation.CreatePortfolioSchema.safeParse(
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

	const result = await professionalService.createPortfolio(
		payload,
		mediaFile,
		user,
	);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Portfolio item added successfully",
		data: result,
	});
});
const getMyPortfolioItems = catchAsync(async (req: Request, res: Response) => {
	const user = req.user!;

	const result = await professionalService.getMyPortfolioItems(user);
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
	const result = await professionalService.updatePortfolioItem(
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
	await professionalService.deletePortfolio(portfolioId as string, user);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "portfolio deleted Successfully",
		data: null,
	});
});
export const professionalController = {
	applyAsProfessional,
	verifyProfessionalEmail,
	approveProfessional,
	getAllProfessionals,
	updateProfessionalProfile,
	addServices,
	getMyServices,
	updateService,
	deleteService,
	createPortfolio,
	getMyPortfolioItems,
	updatePortfolioItem,
	deletePortfolio,
	getAllProfessionalListPublic,
	getSingleProfessionalPublicProfile,
};
