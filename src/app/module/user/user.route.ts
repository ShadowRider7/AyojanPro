import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { upload } from "../../lib/multer";
import { auth } from "../../middleware/auth";
import { userController } from "./user.controller";

const router = Router();

router.patch(
	"/profile-image",
	auth(Role.ADMIN, Role.CLIENT, Role.PROFESSIONAL),
	upload.single("profileImage"),
	userController.uploadProfileImage,
);

export const UserRoutes = router;
