import { z } from "zod";

const raiseDisputeZodSchema = z.object({
	body: z.object({
		reason: z.string().min(3).max(255, "Reason cannot exceed 255 characters"),
		description: z
			.string()
			.min(10, "Please describe the issue in more detail")
			.max(5000, "Description cannot exceed 5000 characters"),
	}),
});

const uploadEvidenceZodSchema = z.object({
	body: z.object({
		type: z.string().max(50).optional(),
		title: z.string().max(255).optional(),
		description: z.string().max(2000).optional(),
		mediaUrl: z.string().url("mediaUrl must be a valid URL"),
	}),
});

const updateDisputeStatusZodSchema = z.object({
	body: z.object({
		status: z.enum(["OPEN", "UNDER_REVIEW", "REJECTED", "CLOSED"]),
	}),
});

const resolveDisputeZodSchema = z.object({
	body: z.object({
		resolution: z
			.string()
			.min(10, "Please provide a resolution summary")
			.max(5000, "Resolution cannot exceed 5000 characters"),
	}),
});

export const disputeValidator = {
	raiseDisputeZodSchema,
	uploadEvidenceZodSchema,
	updateDisputeStatusZodSchema,
	resolveDisputeZodSchema,
};
