export class AppError extends Error {
	public statusCode: number;
	public name: string;

	private static readonly STATUS_TEXT: Record<number, string> = {
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

	constructor(statusCode: number, message: string, stack = "") {
		super(message);

		this.statusCode = statusCode;
		this.name = AppError.STATUS_TEXT[statusCode] || "Internal Server Error";

		if (stack) {
			this.stack = stack;
		} else {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}
