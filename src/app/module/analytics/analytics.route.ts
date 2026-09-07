import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { AnalyticsController } from "./analytics.controller";

const router = Router();

router.get(
	"/client-analytics",
	auth(Role.CLIENT),
	AnalyticsController.getClientAnalytics,
);

router.get(
	"/professional-analytics",
	auth(Role.PROFESSIONAL),
	AnalyticsController.getProfessionalAnalytics,
);

router.get(
	"/admin-analytics",
	auth(Role.ADMIN),
	AnalyticsController.getAdminAnalytics,
);

export const AnalyticsRoutes = router;
