import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { clientController } from "./client.controller";

const router = Router();

router.patch(
	"/my-profile",
	auth(Role.CLIENT),
	clientController.updateClientProfile,
);

export const ClientRoutes = router;
