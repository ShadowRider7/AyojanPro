import { z } from "zod";

const proposalItemZodSchema = z
	.object({
		eventServiceRequirementId: z
			.string()
			.uuid("Each Event Service Requirement ID must be a valid UUID"),

		professionalServiceId: z
			.string()
			.uuid("Each Professional Service ID must be a valid UUID"),

		proposedAmount: z
			.number("Proposed amount is required")
			.positive("Amount must be greater than 0"),

		currency: z.string().max(10, "Currency code too long").default("BDT"),

		proposedStartAt: z.iso.datetime(),

		proposedEndAt: z.iso.datetime(),
	})
	.refine((data) => data.proposedEndAt > data.proposedStartAt, {
		message: "End date must be after the start date",
		path: ["proposedEndAt"],
	});

const createProposalZodSchema = z
	.object({
		body: z.object({
			message: z
				.string()
				.max(5000, "Message cannot exceed 5000 characters")
				.optional(),

			items: z
				.array(proposalItemZodSchema)
				.nonempty("At least one proposal item is required"),
		}),
	})
	.refine(
		(data) => {
			const requirementIds = data.body.items.map(
				(item) => item.eventServiceRequirementId,
			);
			return new Set(requirementIds).size === requirementIds.length;
		},
		{
			message:
				"Cannot submit the same service requirement twice in one proposal",
			path: ["body", "items"],
		},
	);

export const proposalValidator = {
	createProposalZodSchema,
};
