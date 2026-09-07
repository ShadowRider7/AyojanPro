import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { contractController } from "./contract.controller";
import { contractValidator } from "./contract.validator";

const router = Router();

router.get(
	"/",
	auth(Role.CLIENT, Role.PROFESSIONAL, Role.ADMIN),
	contractController.listContracts,
);

router.get(
	"/:id",
	auth(Role.CLIENT, Role.PROFESSIONAL, Role.ADMIN),
	contractController.getContractDetails,
);

router.patch(
	"/:id/cancel",
	auth(Role.CLIENT, Role.PROFESSIONAL, Role.ADMIN),
	validateRequest(contractValidator.cancelContractZodSchema),
	contractController.cancelContract,
);

router.post(
	"/:id/deliverable",
	auth(Role.PROFESSIONAL),
	validateRequest(contractValidator.attachDeliverableZodSchema),
	contractController.attachDeliverable,
);

router.get(
	"/:id/deliverable",
	auth(Role.CLIENT, Role.PROFESSIONAL, Role.ADMIN),
	contractController.getDeliverable,
);

router.patch(
	"/:id/complete",
	auth(Role.CLIENT, Role.ADMIN),
	contractController.completeContract,
);

export const contractRoutes = router;
