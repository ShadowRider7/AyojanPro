import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { adminController } from "./admin.controller";
import { adminValidator } from "./admin.validator";

const router = Router();

router.get("/admin/users", auth(Role.ADMIN), adminController.listUsers);

router.get("/admin/events", auth(Role.ADMIN), adminController.listEvents);

router.get("/admin/contracts", auth(Role.ADMIN), adminController.listContracts);

router.get("/admin/payments", auth(Role.ADMIN), adminController.listPayments);

router.patch(
	"/admin/users/:id/status",
	auth(Role.ADMIN),
	validateRequest(adminValidator.updateUserStatusZodSchema),
	adminController.updateUserStatus,
);

export const adminRoutes = router;
