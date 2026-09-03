import { z } from "zod";

const updateCreatorProfileSchema = z.object({
	bio: z
		.string()
		.max(500, "Bio cannot exceed 500 characters")
		.nullable()
		.optional(),
	location: z.string().min(2, "Location is too short").nullable().optional(),
	contactNumber: z
		.string()
		.regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
		.nullable()
		.optional(),
	experience: z
		.number()
		.int()
		.min(0, "Experience cannot be negative")
		.optional(),
	hourlyRate: z
		.number()
		.positive("Hourly rate must be greater than 0")
		.nullable()
		.optional(),
	isAvailable: z.boolean().optional(),
	website: z.string().url("Invalid URL").nullable().optional(),
	githubUrl: z.string().url("Invalid GitHub URL").nullable().optional(),
	linkedinUrl: z.string().url("Invalid LinkedIn URL").nullable().optional(),
	behanceUrl: z.string().url("Invalid Behance URL").nullable().optional(),
	dribbbleUrl: z.string().url("Invalid Dribbble URL").nullable().optional(),
});

export const CreatorValidation = {
	updateCreatorProfileSchema,
};
