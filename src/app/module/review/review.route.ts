import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { ReviewController } from "./review.controller";
import { ReviewValidation } from "./review.validator";

const router = Router();

router.post(
	"/contracts/:id",
	auth(Role.CLIENT, Role.PROFESSIONAL),
	validateRequest(ReviewValidation.createReviewZodSchema),
	ReviewController.createReview,
);

router.get("/professionals/:id", ReviewController.getProfessionalReviews);

router.get("/clients/:id/reviews", ReviewController.getClientReviews);

export const ReviewRoutes = router;
