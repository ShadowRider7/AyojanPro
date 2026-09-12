import { z } from "zod";

const updateUserStatusZodSchema = z.object({
	body: z.object({
		status: z.enum(["ACTIVE", "SUSPENDED", "BLOCKED"]),
	}),
});

export const adminValidator = {
	updateUserStatusZodSchema,
};
