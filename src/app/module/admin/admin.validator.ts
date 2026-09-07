import { z } from "zod";

const updateUserStatusZodSchema = z.object({
	status: z.enum(["ACTIVE", "SUSPENDED", "BLOCKED"]),
});

export const adminValidator = {
	updateUserStatusZodSchema,
};
