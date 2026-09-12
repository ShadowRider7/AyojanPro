import { z } from "zod";

// POST /contracts/:id/payments/initial
// POST /contracts/:id/payments/final
// GET  /contracts/:id/payments
const contractIdParamZodSchema = z.object({
	params: z.object({
		id: z.string("Contract Id Is Required").uuid({
			message: "Contract Id Must Be A Valid Uuid",
		}),
	}),
});

export const PaymentValidation = {
	contractIdParamZodSchema,
};
