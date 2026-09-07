import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type Application,
	type NextFunction,
	type Request,
	type Response,
} from "express";
import httpStatus from "http-status";
import config from "./app/config";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { adminRoutes } from "./app/module/admin/admin.route";
import { AnalyticsRoutes } from "./app/module/analytics/analytics.route";
import { AuthRoutes } from "./app/module/auth/auth.route";
import { ClientRoutes } from "./app/module/client/client.route";
import { contractRoutes } from "./app/module/contract/contract.route";
import { disputeRoutes } from "./app/module/dispute/dispute.route";
import { EventRoutes } from "./app/module/event/event.route";
import { notificationRoutes } from "./app/module/notification/notification.route";
import { PaymentRoutes } from "./app/module/payment/payment.route";
import { ProfessionalRoutes } from "./app/module/professional/professional.route";
import { proposalRoutes } from "./app/module/proposal/proposal.route";
import { ReviewRoutes } from "./app/module/review/review.route";
import { UserRoutes } from "./app/module/user/user.route";

const app: Application = express();

app.use(
	cors({
		origin: config.frontend_url,
		credentials: true,
	}),
);

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/user", UserRoutes);
app.use("/api/v1/client", ClientRoutes);
app.use("/api/v1/professional", ProfessionalRoutes);
app.use("/api/v1/event", EventRoutes);
app.use("/api/v1/proposal", proposalRoutes);
app.use("/api/v1/payment", PaymentRoutes);
app.use("/api/v1/contract", contractRoutes);
app.use("/api/v1/review", ReviewRoutes);
app.use("/api/v1/notification", notificationRoutes);
app.use("/api/v1/dispute", disputeRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/analytics", AnalyticsRoutes);

// Basic route
app.get("/", async (req: Request, res: Response) => {
	res.status(httpStatus.OK).json({
		success: true,
		message: "Welcome to AyojanPro System Backend",
	});
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
