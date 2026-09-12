import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import type z from "zod";
import { AppError } from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";

export const validateRequest = (zodSchema: z.ZodObject) => {
	return catchAsync((req: Request, res: Response, next: NextFunction) => {
		const schemaKeys = Object.keys(zodSchema.shape);

		const payload: Record<string, unknown> = {};
		if (schemaKeys.includes("body")) {
			payload.body = req.body ?? {};
		}
		if (schemaKeys.includes("params")) {
			payload.params = req.params ?? {};
		}
		if (schemaKeys.includes("query")) {
			payload.query = req.query ?? {};
		}

		const result = zodSchema.safeParse(payload);

		if (!result.success) {
			console.log(result.error);
			console.log(result.error.issues);

			throw new AppError(
				httpStatus.BAD_REQUEST,
				result.error.issues[0].message,
			);
		}

		if (result.data.body !== undefined) {
			req.body = result.data.body;
		}
		if (result.data.params !== undefined) {
			Object.assign(req.params, result.data.params);
		}
		if (result.data.query !== undefined) {
			Object.assign(req.query, result.data.query);
		}

		next();
	});
};
