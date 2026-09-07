import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { clientController } from "./client.controller";
import { ClientValidation } from "./client.validation";

const router = Router();

router.patch(
	"/my-profile",
	auth(Role.CLIENT),
	validateRequest(ClientValidation.updateClientProfileSchema),
	clientController.updateClientProfile,
);

export const ClientRoutes = router;
