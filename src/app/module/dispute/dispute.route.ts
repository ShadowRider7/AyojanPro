import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { disputeController } from "./dispute.controller";
import { disputeValidator } from "./dispute.validator";

const router = Router();

router.post(
	"/contracts/:id/disputes",
	auth(Role.CLIENT, Role.PROFESSIONAL),
	validateRequest(disputeValidator.raiseDisputeZodSchema),
	disputeController.raiseDispute,
);

router.get("/disputes", auth(Role.ADMIN), disputeController.listDisputes);

router.get(
	"/disputes/:id",
	auth(Role.CLIENT, Role.PROFESSIONAL, Role.ADMIN),
	disputeController.getDisputeDetails,
);

router.post(
	"/disputes/:id/evidence",
	auth(Role.CLIENT, Role.PROFESSIONAL, Role.ADMIN),
	validateRequest(disputeValidator.uploadEvidenceZodSchema),
	disputeController.uploadEvidence,
);

router.patch(
	"/disputes/:id/status",
	auth(Role.ADMIN),
	validateRequest(disputeValidator.updateDisputeStatusZodSchema),
	disputeController.updateDisputeStatus,
);

router.patch(
	"/disputes/:id/resolve",
	auth(Role.ADMIN),
	validateRequest(disputeValidator.resolveDisputeZodSchema),
	disputeController.resolveDispute,
);

export const disputeRoutes = router;
