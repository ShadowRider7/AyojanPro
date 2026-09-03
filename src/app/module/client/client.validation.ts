import { z } from "zod";

const updateClientProfileSchema = z.object({
	companyName: z
		.string()
		.min(1, "Company name cannot be empty")
		.nullable()
		.optional(),
	bio: z
		.string()
		.max(500, "Bio cannot exceed 500 characters")
		.nullable()
		.optional(),
	phone: z
		.string()
		.regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
		.nullable()
		.optional(),
	location: z.string().min(2, "Location is too short").nullable().optional(),
	website: z.string().url("Invalid URL").nullable().optional(),
	industry: z
		.string()
		.min(2, "Industry name is too short")
		.nullable()
		.optional(),
});

export const ClientValidation = {
	updateClientProfileSchema,
};
