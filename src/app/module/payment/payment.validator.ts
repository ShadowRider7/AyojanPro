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

// POST /payments/bkash/callback
// bKash redirects with paymentID + status as query params, but some
// integrations post them as a JSON body instead — we accept either.
const bkashCallbackZodSchema = z.object({
	query: z
		.object({
			paymentID: z.string().optional(),
			status: z.string().optional(),
		})
		.optional(),
	body: z
		.object({
			paymentID: z.string().optional(),
			status: z.string().optional(),
		})
		.optional(),
});

export const PaymentValidation = {
	contractIdParamZodSchema,
	bkashCallbackZodSchema,
};
