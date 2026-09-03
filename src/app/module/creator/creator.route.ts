import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { upload } from "../../lib/multer";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { creatorController } from "./creator.controller";
import { CreatorValidation } from "./creator.validation";

const router = Router();

router.patch(
	"/my-profile",
	auth(Role.CREATOR),
	validateRequest(CreatorValidation.updateCreatorProfileSchema),
	creatorController.updateCreatorProfile,
);
router.post("/service", auth(Role.CREATOR), creatorController.addServices);

router.get("/me/services", auth(Role.CREATOR), creatorController.getMyServices);

router.patch(
	"/service/:id",
	auth(Role.CREATOR),
	creatorController.updateService,
);

router.delete(
	"/service/:id",
	auth(Role.CREATOR),
	creatorController.deleteService,
);

router.post(
	"/portfolio",
	auth(Role.CREATOR),
	upload.fields([
		{
			name: "mediaFile",
			maxCount: 1,
		},
	]),
	creatorController.createPortfolio,
);

router.get(
	"/me/portfolio",
	auth(Role.CREATOR),
	creatorController.getMyPortfolioItems,
);

router.patch(
	"/portfolio/:id",
	auth(Role.CREATOR),
	creatorController.updatePortfolioItem,
);

router.delete(
	"/portfolio/:id",
	auth(Role.CREATOR),
	creatorController.deletePortfolio,
);

export const CreatorRoutes = router;
