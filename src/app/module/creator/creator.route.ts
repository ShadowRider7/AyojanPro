import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { creatorController } from "./creator.controller";

const router = Router();

router.patch(
	"/my-profile",
	auth(Role.CREATOR),
	creatorController.updateCreatorProfile,
);

export const CreatorRoutes = router;
