import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AnalyticsServices } from "./analytics.service";

const getClientAnalytics = catchAsync(async (req: Request, res: Response) => {
	const user = req.user!;

	const result = await AnalyticsServices.getClientAnalytics(user);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Client Analytics Retrieved Successfully",
		data: result,
	});
});

const getProfessionalAnalytics = catchAsync(
	async (req: Request, res: Response) => {
		const user = req.user!;

		const result = await AnalyticsServices.getProfessionalAnalytics(user);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Professional Analytics Retrieved Successfully",
			data: result,
		});
	},
);

const getAdminAnalytics = catchAsync(async (req: Request, res: Response) => {
	const result = await AnalyticsServices.getAdminAnalytics();
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Admin Analytics Retrieved Successfully",
		data: result,
	});
});

export const AnalyticsController = {
	getClientAnalytics,
	getProfessionalAnalytics,
	getAdminAnalytics,
};
