import { z } from "zod";

const cancelContractZodSchema = z.object({
	reason: z
		.string()
		.max(2000, "Reason cannot exceed 2000 characters")
		.optional(),
});

const attachDeliverableZodSchema = z.object({
	title: z.string().max(255, "Title too long").optional(),
	description: z.string().max(5000, "Description too long").optional(),
	externalUrl: z
		.array(z.string().url("Each deliverable link must be a valid URL"))
		.nonempty("At least one deliverable link is required"),
});

export const contractValidator = {
	cancelContractZodSchema,
	attachDeliverableZodSchema,
};
