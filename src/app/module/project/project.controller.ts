import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { projectService } from "./project.service";

const createProject = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const user = req.user!;

	const result = await projectService.createProject(payload, user);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Service added Successfully",
		data: result,
	});
});

export const projectController = {
	createProject,
};
