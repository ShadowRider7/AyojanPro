import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { projectController } from "./project.controller";

const router = Router();

router.post("/project", auth(Role.CLIENT), projectController.createProject);

export const ProjectRoutes = router;
