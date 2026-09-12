import { z } from "zod";

const updateClientProfileSchema = z.object({
	body: z.object({
		bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
		phone: z
			.string()
			.regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
			.optional(),
		address: z.string().min(2, "Address is too short").optional(),
		city: z.string().optional(),
		country: z.string().optional(),
	}),
});

export const ClientValidation = {
	updateClientProfileSchema,
};
