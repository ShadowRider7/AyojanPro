import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";

const updateCreatorProfile = catchAsync(
	async (req: Request, res: Response) => {},
);

export const creatorController = {
	updateCreatorProfile,
};
