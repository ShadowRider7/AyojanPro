import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { notificationController } from "./notification.controller";

const router = Router();

router.get(
	"/notifications",
	auth(Role.CLIENT, Role.PROFESSIONAL, Role.ADMIN),
	notificationController.listNotifications,
);

router.patch(
	"/notifications/read-all",
	auth(Role.CLIENT, Role.PROFESSIONAL, Role.ADMIN),
	notificationController.markAllAsRead,
);

router.patch(
	"/notifications/:id/read",
	auth(Role.CLIENT, Role.PROFESSIONAL, Role.ADMIN),
	notificationController.markAsRead,
);

export const notificationRoutes = router;
