import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "../../generated/prisma/client";
import config from "../config";
import { AppError } from "../utils/AppError";

const STATUS_TEXT: Record<number, string> = {
	200: "OK",
	201: "Created",
	400: "Bad Request",
	401: "Unauthorized",
	403: "Forbidden",
	404: "Not Found",
	409: "Conflict",
	422: "Unprocessable Entity",
	429: "Too Many Requests",
	500: "Internal Server Error",
	502: "Bad Gateway",
	503: "Service Unavailable",
};

const handlePrismaError = (err: Prisma.PrismaClientKnownRequestError) => {
	switch (err.code) {
		case "P2002": {
			const target = (err.meta?.target as string[]) || [];
			const fields = target.length ? ` (${target.join(", ")})` : "";
			return {
				statusCode: httpStatus.CONFLICT,
				message: `Duplicate value${fields} already exists`,
			};
		}
		case "P2003": {
			const field = (err.meta?.field_name as string) || "unknown";
			return {
				statusCode: httpStatus.BAD_REQUEST,
				message: `Foreign key constraint failed on field "${field}"`,
			};
		}
		case "P2025": {
			return {
				statusCode: httpStatus.NOT_FOUND,
				message:
					"An operation failed because it depends on one or more records that were required but not found",
			};
		}
		default:
			return {
				statusCode: httpStatus.INTERNAL_SERVER_ERROR,
				message: "Database request error",
			};
	}
};

export const globalErrorHandler = async (
	err: any,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	const isDev = config.node_env === "development";

	if (isDev) {
		console.error("=== Global Error Handler ===");
		console.error("Name:", err.name);
		console.error("Message:", err.message);
		console.error("Stack:", err.stack);
		if (err instanceof Prisma.PrismaClientKnownRequestError) {
			console.error("Prisma Code:", err.code);
			console.error("Prisma Meta:", err.meta);
		}
	}

	let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
	let message = "Internal Server Error";
	let name = "Internal Server Error";

	if (err instanceof AppError) {
		statusCode = err.statusCode;
		message = err.message;
		name = err.name;
	} else if (err instanceof Prisma.PrismaClientValidationError) {
		statusCode = httpStatus.BAD_REQUEST;
		message = "You have provided incorrect field type or missing fields";
		name = "Bad Request";
	} else if (err instanceof Prisma.PrismaClientKnownRequestError) {
		const prismaResult = handlePrismaError(err);
		statusCode = prismaResult.statusCode;
		message = prismaResult.message;
	} else if (err instanceof Prisma.PrismaClientInitializationError) {
		if (err.errorCode === "P1000") {
			statusCode = httpStatus.UNAUTHORIZED;
			message =
				"Authentication failed against database server. Please check your credentials";
		} else if (err.errorCode === "P1001") {
			statusCode = httpStatus.BAD_REQUEST;
			message = "Cannot reach database server";
		}
	} else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
		statusCode = httpStatus.INTERNAL_SERVER_ERROR;
		message = "Error occurred during query execution";
	} else if (err.statusCode) {
		statusCode = err.statusCode;
		message = err.message;
	} else if (err instanceof SyntaxError) {
		statusCode = httpStatus.BAD_REQUEST;
		message = "Invalid JSON in request body";
	} else if (err instanceof Error) {
		message = err.message;
	}

	name = STATUS_TEXT[statusCode] || name;

	res.status(statusCode).json({
		success: false,
		statusCode,
		name,
		message,
		...(isDev && {
			error: {
				name: err.name,
				message: err.message,
				stack: err.stack,
			},
		}),
	});
};
