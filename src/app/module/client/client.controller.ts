import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";

const updateClientProfile = catchAsync(
	async (req: Request, res: Response) => {},
);

export const clientController = {
	updateClientProfile,
};
