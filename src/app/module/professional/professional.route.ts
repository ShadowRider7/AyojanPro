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
	validateRequest(ProfessionalValidation.verifyProfessionalEmailSchema),
	professionalController.verifyProfessionalEmail,
);
router.post(
	"/approve-professional",
	auth(Role.ADMIN),
	validateRequest(ProfessionalValidation.approveProfessionalSchema),
	professionalController.approveProfessional,
);

router.get(
	"/all-professionals",
	auth(Role.ADMIN),
	validateRequest(ProfessionalValidation.getAllProfessionalsSchema),
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
	validateRequest(ProfessionalValidation.getAllProfessionalListPublicSchema),
	professionalController.getAllProfessionalListPublic,
);

router.get(
	"/public/:professionalId",
	validateRequest(
		ProfessionalValidation.getSingleProfessionalPublicProfileSchema,
	),
	professionalController.getSingleProfessionalPublicProfile,
);

router.post(
	"/service",
	auth(Role.PROFESSIONAL),
	validateRequest(ProfessionalValidation.addServiceSchema),
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
	validateRequest(ProfessionalValidation.updateServiceSchema),
	professionalController.updateService,
);

router.delete(
	"/service/:id",
	auth(Role.PROFESSIONAL),
	validateRequest(ProfessionalValidation.deleteServiceSchema),
	professionalController.deleteService,
);

router.post(
	"/skill",
	auth(Role.PROFESSIONAL),
	validateRequest(ProfessionalValidation.addSkillSchema),
	professionalController.addSkill,
);

router.delete(
	"/skill/:id",
	auth(Role.PROFESSIONAL),
	validateRequest(ProfessionalValidation.deleteSkillSchema),
	professionalController.deleteSkill,
);

router.post(
	"/experience",
	auth(Role.PROFESSIONAL),
	validateRequest(ProfessionalValidation.addExperienceSchema),
	professionalController.addExperience,
);

router.patch(
	"/experience/:id",
	auth(Role.PROFESSIONAL),
	validateRequest(ProfessionalValidation.updateExperienceSchema),
	professionalController.updateExperience,
);

router.delete(
	"/experience/:id",
	auth(Role.PROFESSIONAL),
	validateRequest(ProfessionalValidation.deleteExperienceSchema),
	professionalController.deleteExperience,
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
	validateRequest(ProfessionalValidation.updatePortfolioItemSchema),
	professionalController.updatePortfolioItem,
);

router.delete(
	"/portfolio/:id",
	auth(Role.PROFESSIONAL),
	validateRequest(ProfessionalValidation.deletePortfolioSchema),
	professionalController.deletePortfolio,
);

export const ProfessionalRoutes = router;
