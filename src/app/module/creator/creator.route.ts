import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { creatorController } from "./creator.controller";
import { CreatorValidation } from "./creatore.validation";

const router = Router();

router.patch(
	"/my-profile",
	auth(Role.CREATOR),
	validateRequest(CreatorValidation.updateCreatorProfileSchema),
	creatorController.updateCreatorProfile,
);

export const CreatorRoutes = router;
