import { z } from "zod";

const applyAsProfessionalSchema = z.object({
	user: z.object({
		name: z.string().min(2, "Name must be at least 2 characters long"),
		email: z.string().email("Invalid email address"),
	}),
	professional: z.object({
		phone: z
			.string()
			.max(30, "Phone number cannot exceed 30 characters")
			.optional()
			.or(z.literal("")),
		address: z.string().optional().or(z.literal("")),
		city: z
			.string()
			.max(100, "City name cannot exceed 100 characters")
			.optional()
			.or(z.literal("")),
		country: z
			.string()
			.max(100, "Country name cannot exceed 100 characters")
			.optional()
			.or(z.literal("")),
		professionalTitle: z
			.string()
			.min(2, "Professional title is required")
			.max(255),
		bio: z.string().optional().or(z.literal("")),
		experienceYears: z
			.number()
			.int()
			.nonnegative("Experience years must be a positive integer"),
	}),
});

const updateProfessionalProfileSchema = z.object({
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

export const CreatePortfolioSchema = z.object({
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

	eventType: z
		.string()
		.max(100, "Event type must be 100 characters or less")
		.trim()
		.optional(),

	workDays: z
		.string("Work days is required")
		.min(1, "Work days cannot be empty")
		.trim(),

	mediaUrl: z.string("Media URL is required").url("Invalid media URL format"),

	publicId: z
		.string("Public ID is required")
		.min(1, "Public ID cannot be empty"),

	externalUrl: z
		.string()
		.url("Invalid external URL format")
		.optional()
		.or(z.literal("")),
});

export const ProfessionalValidation = {
	applyAsProfessionalSchema,
	updateProfessionalProfileSchema,
	CreatePortfolioSchema,
};
