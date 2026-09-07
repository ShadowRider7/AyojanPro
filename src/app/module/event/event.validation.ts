import * as z from "zod";

const eventServiceRequirementCreateSchema = z
	.object({
		serviceName: z.string().min(1, "Service name is required").max(150),

		description: z.string().optional(),

		budget: z.number().positive("Budget must be greater than 0"),

		currency: z.string().max(10).default("BDT"),

		startAt: z.coerce.date(),

		endAt: z.coerce.date(),
	})
	.refine((data) => data.startAt < data.endAt, {
		message: "Service start time must be before its end time",
		path: ["endAt"],
	});

const eventCreateSchema = z
	.object({
		title: z.string().min(1, "Title is required").max(255),

		description: z.string().optional(),

		eventType: z.string().max(150).optional(),

		city: z.string().max(100).optional(),

		country: z.string().max(100).optional(),

		address: z.string().optional(),

		startAt: z.coerce.date(),

		endAt: z.coerce.date(),
	})
	.refine((data) => data.startAt < data.endAt, {
		message: "Service start time must be before its end time",
		path: ["endAt"],
	});

const eventUpdateSchema = z
	.object({
		title: z.string().min(1, "Title cannot be empty").max(255).optional(),
		description: z.string().optional(),
		eventType: z.string().max(150).optional(),
		city: z.string().max(100).optional(),
		country: z.string().max(100).optional(),
		address: z.string().optional(),
		startAt: z.coerce.date().optional(),
		endAt: z.coerce.date().optional(),
	})
	.refine(
		(data) => {
			// Only validate chronology if both dates are being explicitly updated
			if (data.startAt && data.endAt) {
				return data.startAt < data.endAt;
			}
			return true;
		},
		{
			message: "Event start time must be before its end time",
			path: ["endAt"],
		},
	);

const eventServiceRequirementUpdateSchema = z
	.object({
		serviceName: z
			.string()
			.min(1, "Service name is required")
			.max(150)
			.optional(),

		description: z.string().optional(),

		budget: z.number().positive("Budget must be greater than 0").optional(),

		currency: z.string().max(10).default("BDT").optional(),

		startAt: z.coerce.date().optional(),

		endAt: z.coerce.date().optional(),
	})
	.refine(
		(data) => {
			if (data.startAt && data.endAt) {
				return data.startAt < data.endAt;
			}
			return true;
		},
		{
			message: "Event start time must be before its end time",
			path: ["endAt"],
		},
	);

export const eventValidator = {
	eventServiceRequirementCreateSchema,
	eventServiceRequirementUpdateSchema,
	eventCreateSchema,
	eventUpdateSchema,
};
