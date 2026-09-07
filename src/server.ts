import app from "./app";
import config from "./app/config";
import { transporter } from "./app/lib/nodemailer";
import { prisma } from "./app/lib/prisma";
import { redisClient } from "./app/lib/redis";
import {
	seedTesterAdmin,
	seedTesterClient,
	seedTesterProfessional,
} from "./app/utils/seed";

const PORT = config.port;

let isInitialized = false;

const main = async () => {
	if (isInitialized) return;

	try {
		await prisma.$connect();
		console.log("Connected to the database successfully.");

		if (!redisClient.isOpen) {
			await redisClient.connect();
			console.log("Redis Connected Successfully.");
		}

		await transporter.verify();
		console.log("Nodemailer Connected Successfully.");

		await seedTesterAdmin();
		await seedTesterClient();
		await seedTesterProfessional();

		isInitialized = true;
	} catch (error) {
		console.error("Error starting the server:", error);
		await prisma.$disconnect();

		throw error;
	}
};

app.use(async (req, res, next) => {
	try {
		await main();
		next();
	} catch (error) {
		res.status(500).json({
			error: "Internal Server Error",
			message: "Failed to initialize background connections.",
		});
	}
});

if (process.env.NODE_ENV !== "production") {
	app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
	});
}

export default app;
