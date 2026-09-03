import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { creatorService } from "./creator.service";

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

export const creatorController = {
	updateCreatorProfile,
};
