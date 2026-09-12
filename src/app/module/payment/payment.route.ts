import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { PaymentController } from "./payment.controller";
import { PaymentValidation } from "./payment.validator";

const router = Router();

router.post(
	"/contracts/:id/initial",
	auth(Role.CLIENT),
	validateRequest(PaymentValidation.contractIdParamZodSchema),
	PaymentController.initiateInitialPayment,
);

router.post(
	"/contracts/:id/final",
	auth(Role.CLIENT),
	validateRequest(PaymentValidation.contractIdParamZodSchema),
	PaymentController.initiateFinalPayment,
);

router.post(
	"/bkash/callback",
	PaymentController.bkashPaymentCallback,
);
router.get(
	"/contracts/:id",
	auth(Role.CLIENT, Role.PROFESSIONAL, Role.ADMIN),
	validateRequest(PaymentValidation.contractIdParamZodSchema),
	PaymentController.getContractPayments,
);

export const PaymentRoutes = router;
