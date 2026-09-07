import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { PaymentController } from "./payment.controller";
import { PaymentValidation } from "./payment.validator";

const router = Router();

// Initiate 30% upfront payment — contract must be PENDING
router.post(
	"/contracts/:id/initial",
	auth(Role.CLIENT),
	validateRequest(PaymentValidation.contractIdParamZodSchema),
	PaymentController.initiateInitialPayment,
);

// Initiate 70% final payment — contract must be DELIVERED
router.post(
	"/contracts/:id/final",
	auth(Role.CLIENT),
	validateRequest(PaymentValidation.contractIdParamZodSchema),
	PaymentController.initiateFinalPayment,
);

// bKash payment callback — no auth, payment is verified server-side
// against bKash's execute endpoint before anything is trusted.
router.post(
	"/bkash/callback",
	validateRequest(PaymentValidation.bkashCallbackZodSchema),
	PaymentController.bkashPaymentCallback,
);

// List all payments (INITIAL + FINAL) for a contract
router.get(
	"/contracts/:id",
	auth(Role.CLIENT, Role.PROFESSIONAL, Role.ADMIN),
	validateRequest(PaymentValidation.contractIdParamZodSchema),
	PaymentController.getContractPayments,
);

export const PaymentRoutes = router;
