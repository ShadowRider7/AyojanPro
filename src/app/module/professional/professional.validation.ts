import z from "zod";

const applyAsProfessionalSchema = z.object({
	body: z.object({
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
	}),
});

const verifyProfessionalEmailSchema = z.object({
	body: z.object({
		email: z.string().email("Invalid email address"),
		otp: z.string().regex(/^\d{6}$/, "OTP must be a 6-digit number"),
	}),
});

const approveProfessionalSchema = z.object({
	body: z.object({
		professionalId: z.string().min(1, "Professional ID is required"),
		status: z.enum(["PENDING", "APPROVED", "REJECTED"], {
			message: "Status must be PENDING, APPROVED, or REJECTED",
		}),
		rejectionReason: z.string().optional(),
	}),
});

const getAllProfessionalsSchema = z.object({
	query: z.object({
		searchTerm: z.string().optional(),
		professionalTitle: z.string().optional(),
		city: z.string().optional(),
		country: z.string().optional(),
		minExperience: z.string().optional(),
		maxExperience: z.string().optional(),
		minRating: z.string().optional(),
		acceptingBookings: z.string().optional(),
		status: z.string().optional(),
		page: z.string().optional(),
		limit: z.string().optional(),
		sortBy: z.string().optional(),
		sortOrder: z.enum(["asc", "desc"]).optional(),
	}),
});

const getAllProfessionalListPublicSchema = z.object({
	query: z.object({
		searchTerm: z.string().optional(),
		professionalTitle: z.string().optional(),
		page: z.string().optional(),
		limit: z.string().optional(),
		sortBy: z.string().optional(),
		sortOrder: z.enum(["asc", "desc"]).optional(),
	}),
});

const getSingleProfessionalPublicProfileSchema = z.object({
	params: z.object({
		professionalId: z.string().min(1, "Professional ID is required"),
	}),
});

const updateProfessionalProfileSchema = z.object({
	body: z.object({
		bio: z
			.string()
			.max(500, "Bio cannot exceed 500 characters")
			.nullable()
			.optional(),
		professionalTitle: z
			.string()
			.min(2, "Professional title is required")
			.max(255)
			.nullable()
			.optional(),
		phone: z
			.string()
			.max(30, "Phone number cannot exceed 30 characters")
			.nullable()
			.optional(),
		address: z.string().nullable().optional(),
		city: z
			.string()
			.max(100, "City name cannot exceed 100 characters")
			.nullable()
			.optional(),
		country: z
			.string()
			.max(100, "Country name cannot exceed 100 characters")
			.nullable()
			.optional(),
		experienceYears: z
			.number()
			.int()
			.nonnegative("Experience years must be a positive integer")
			.optional(),
	}),
});

const addServiceSchema = z.object({
	body: z.object({
		name: z
			.string()
			.min(1, "Service name is required")
			.max(255, "Service name cannot exceed 255 characters"),
		description: z
			.string()
			.max(1000, "Description cannot exceed 1000 characters")
			.optional(),
	}),
});

const updateServiceSchema = z.object({
	params: z.object({
		id: z.string().min(1, "Service ID is required"),
	}),
	body: z.object({
		name: z
			.string()
			.min(1, "Service name is required")
			.max(255, "Service name cannot exceed 255 characters")
			.optional(),
		description: z
			.string()
			.max(1000, "Description cannot exceed 1000 characters")
			.optional(),
	}),
});

const deleteServiceSchema = z.object({
	params: z.object({
		id: z.string().min(1, "Service ID is required"),
	}),
});

const addSkillSchema = z.object({
	body: z.object({
		name: z
			.string()
			.min(1, "Skill name is required")
			.max(255, "Skill name cannot exceed 255 characters"),
		description: z
			.string()
			.max(500, "Description cannot exceed 500 characters")
			.optional(),
	}),
});

const deleteSkillSchema = z.object({
	params: z.object({
		id: z.string().min(1, "Skill ID is required"),
	}),
});

const addExperienceSchema = z.object({
	body: z.object({
		title: z
			.string()
			.min(1, "Experience title is required")
			.max(255, "Title cannot exceed 255 characters"),
		description: z
			.string()
			.max(1000, "Description cannot exceed 1000 characters")
			.optional(),
		organization: z
			.string()
			.max(255, "Organization name cannot exceed 255 characters")
			.optional(),
		startDate: z.string().optional(),
		endDate: z.string().optional(),
	}),
});

const updateExperienceSchema = z.object({
	params: z.object({
		id: z.string().min(1, "Experience ID is required"),
	}),
	body: z.object({
		title: z
			.string()
			.min(1, "Experience title is required")
			.max(255, "Title cannot exceed 255 characters")
			.optional(),
		description: z
			.string()
			.max(1000, "Description cannot exceed 1000 characters")
			.optional(),
		organization: z
			.string()
			.max(255, "Organization name cannot exceed 255 characters")
			.optional(),
		startDate: z.string().optional(),
		endDate: z.string().optional(),
	}),
});

const deleteExperienceSchema = z.object({
	params: z.object({
		id: z.string().min(1, "Experience ID is required"),
	}),
});

const CreatePortfolioSchema = z.object({
	body: z.object({
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

		externalUrl: z
			.string()
			.url("Invalid external URL format")
			.optional()
			.or(z.literal("")),
	}),
});

const updatePortfolioItemSchema = z.object({
	params: z.object({
		id: z.string().min(1, "Portfolio ID is required"),
	}),
	body: z.object({
		title: z
			.string()
			.min(1, "Title cannot be empty")
			.max(255, "Title must be 255 characters or less")
			.trim()
			.optional(),
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
		workDays: z.string().optional(),
		externalUrl: z
			.string()
			.url("Invalid external URL format")
			.optional()
			.or(z.literal("")),
	}),
});

const deletePortfolioSchema = z.object({
	params: z.object({
		id: z.string().min(1, "Portfolio ID is required"),
	}),
});

export const ProfessionalValidation = {
	applyAsProfessionalSchema,
	verifyProfessionalEmailSchema,
	approveProfessionalSchema,
	getAllProfessionalsSchema,
	getAllProfessionalListPublicSchema,
	getSingleProfessionalPublicProfileSchema,
	updateProfessionalProfileSchema,
	addServiceSchema,
	updateServiceSchema,
	deleteServiceSchema,
	addSkillSchema,
	deleteSkillSchema,
	addExperienceSchema,
	updateExperienceSchema,
	deleteExperienceSchema,
	CreatePortfolioSchema,
	updatePortfolioItemSchema,
	deletePortfolioSchema,
};
