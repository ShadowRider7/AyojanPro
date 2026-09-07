import { z } from "zod";

const createReviewZodSchema = z.object({
	body: z.object({
		rating: z
			.number("Rating Is Required")
			.int({ message: "Rating Must Be A Whole Number" })
			.min(1, "Rating Must Be At Least 1")
			.max(5, "Rating Cannot Be More Than 5"),
		comment: z.string().max(2000).optional(),
	}),
});

export const ReviewValidation = {
	createReviewZodSchema,
};
