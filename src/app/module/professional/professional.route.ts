import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { upload } from "../../lib/multer";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { professionalController } from "./professional.controller";
import { ProfessionalValidation } from "./professional.validation";

const router = Router();

router.post(
	"/apply-as-professional",
	upload.fields([
		{
			name: "resume",
			maxCount: 1,
		},

		{
			name: "additionalFiles",
			maxCount: 10,
		},
	]),
	professionalController.applyAsProfessional,
);

router.post(
	"/apply-as-professional/verify-email",
	professionalController.verifyProfessionalEmail,
);
router.post(
	"/approve-professional",
	auth(Role.ADMIN),
	professionalController.approveProfessional,
);

router.get(
	"/all-professionals",
	auth(Role.ADMIN),
	professionalController.getAllProfessionals,
);

router.patch(
	"/update-my-profile",
	auth(Role.PROFESSIONAL),
	validateRequest(ProfessionalValidation.updateProfessionalProfileSchema),
	professionalController.updateProfessionalProfile,
);

router.get(
	"/public/all-Professionals",
	professionalController.getAllProfessionalListPublic,
);

router.get(
	"/public/:professionalId",
	professionalController.getSingleProfessionalPublicProfile,
);

router.post(
	"/service",
	auth(Role.PROFESSIONAL),
	professionalController.addServices,
);

router.get(
	"/me/services",
	auth(Role.PROFESSIONAL),
	professionalController.getMyServices,
);

router.patch(
	"/service/:id",
	auth(Role.PROFESSIONAL),
	professionalController.updateService,
);

router.delete(
	"/service/:id",
	auth(Role.PROFESSIONAL),
	professionalController.deleteService,
);

router.post(
	"/portfolio",
	auth(Role.PROFESSIONAL),
	upload.fields([
		{
			name: "mediaFile",
			maxCount: 1,
		},
	]),
	professionalController.createPortfolio,
);

router.get(
	"/me/portfolio",
	auth(Role.PROFESSIONAL),
	professionalController.getMyPortfolioItems,
);

router.patch(
	"/portfolio/:id",
	auth(Role.PROFESSIONAL),
	professionalController.updatePortfolioItem,
);

router.delete(
	"/portfolio/:id",
	auth(Role.PROFESSIONAL),
	professionalController.deletePortfolio,
);

export const ProfessionalRoutes = router;
