import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validateRequest";
import { contractController } from "./contract.controller";
import { contractValidator } from "./contract.validator";

const router = Router();

router.get(
	"/contracts",
	auth(Role.CLIENT, Role.PROFESSIONAL, Role.ADMIN),
	contractController.listContracts,
);

router.get(
	"/contracts/:id",
	auth(Role.CLIENT, Role.PROFESSIONAL, Role.ADMIN),
	contractController.getContractDetails,
);

router.patch(
	"/contracts/:id/cancel",
	auth(Role.CLIENT, Role.PROFESSIONAL, Role.ADMIN),
	validateRequest(contractValidator.cancelContractZodSchema),
	contractController.cancelContract,
);

router.post(
	"/contracts/:id/deliverable",
	auth(Role.PROFESSIONAL),
	validateRequest(contractValidator.attachDeliverableZodSchema),
	contractController.attachDeliverable,
);

router.get(
	"/contracts/:id/deliverable",
	auth(Role.CLIENT, Role.PROFESSIONAL, Role.ADMIN),
	contractController.getDeliverable,
);

router.patch(
	"/contracts/:id/complete",
	auth(Role.CLIENT, Role.ADMIN),
	contractController.completeContract,
);

export const contractRoutes = router;
