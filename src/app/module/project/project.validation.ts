import { z } from "zod";

export const projectCreateSchema = z.object({
	clientId: z.string().uuid({ message: "Invalid client ID format" }),

	title: z
		.string()
		.min(3, { message: "Title must be at least 3 characters long" })
		.max(255, { message: "Title cannot exceed 255 characters" }),

	description: z
		.string()
		.min(10, { message: "Description must be at least 10 characters long" }),

	// Validates a positive number with up to 2 decimal places
	budget: z
		.number()
		.positive({ message: "Budget must be a positive number" })
		.max(9999999999.99, { message: "Budget exceeds maximum allowed limit" })
		.transform((val) => Number(val.toFixed(2))),

	// Accepts a valid Date object or an ISO date string, ensuring it is in the future
	deadline: z.coerce.date().refine((date) => date > new Date(), {
		message: "Deadline must be a future date",
	}),

	location: z.string().trim().nullable().optional(),

	category: z
		.string()
		.max(100, { message: "Category cannot exceed 100 characters" })
		.trim()
		.nullable()
		.optional(),

	requiredServices: z
		.array(z.string().min(1, { message: "Service name cannot be empty" }))
		.min(1, { message: "At least one required service must be selected" }),
});

// Infer the TypeScript type directly from the schema
export type TProjectCreateInput = z.infer<typeof projectCreateSchema>;
