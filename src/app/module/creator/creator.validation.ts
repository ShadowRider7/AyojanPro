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
		.regex(
			/^\+?[1-9]\d{1,14}$/,
			"Invalid phone number,please write the phone number with country code",
		)
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
const CreatePortfolioSchema = z.object({
	title: z
		.string("Title is required")
		.min(1, "Title cannot be empty")
		.max(255, "Title must be 255 characters or less")
		.trim(),

	description: z
		.string()
		.max(1000, "Description must be 1000 characters or less")
		.trim()
		.optional(),

	category: z
		.string()
		.max(100, "Category must be 100 characters or less")
		.trim()
		.optional(),

	tools: z
		.array(z.string().min(1, "Tool name cannot be empty"))
		.nonempty({ message: "At least one tool must be specified" }),

	thumbnailUrl: z.string().url("Invalid thumbnail URL format").optional(),

	mediaUrl: z.string("Media URL is required").url("Invalid media URL format"),

	publicId: z
		.string("Public ID is required")
		.min(1, "Public ID cannot be empty"),

	externalUrl: z.string().url("Invalid external URL format").optional(),
});
export const CreatorValidation = {
	updateCreatorProfileSchema,
	CreatePortfolioSchema,
};
