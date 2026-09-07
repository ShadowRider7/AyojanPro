import app from "./app";
import config from "./app/config";
import { transporter } from "./app/lib/nodemailer";
import { prisma } from "./app/lib/prisma";
import { redisClient } from "./app/lib/redis";

const PORT = config.port;
let isInitialized = false;

// Optimization: Connect to external infrastructure lazily
const main = async () => {
	if (isInitialized) return;

	try {
		// Prisma automatically connects on the first query, but manual connection is safe if quick
		await prisma.$connect();
		console.log("Connected to the database successfully.");

		// Optional: Only attempt to connect to Redis if a URL is provided
		// Serverless environments scale up fast; heavy handshakes should be optimized
		if (process.env.REDIS_URL && !redisClient.isOpen) {
			await redisClient.connect();
			console.log("Redis Connected Successfully.");
		}

		// Skip heavy verification checks during rapid serverless invocation spikes
		if (process.env.NODE_ENV !== "production") {
			await transporter.verify();
			console.log("Nodemailer Connected Successfully.");
		}

		isInitialized = true;
	} catch (error) {
		console.error("Error starting the server:", error);
		// In serverless, do not disconnect global prisma instances destructively
		throw error;
	}
};

// Express Middleware to ensure connections are established
app.use(async (req, res, next) => {
	try {
		await main();
		next();
	} catch (error) {
		console.error("Initialization Middleware Error:", error);
		res.status(500).json({
			error: "Internal Server Error",
			message: "Failed to initialize background connections.",
		});
	}
});

// Traditional listening port wrapper for local development
if (process.env.NODE_ENV !== "production") {
	app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
	});
}

// CRITICAL FOR VERCEL: Provide both modern export and common JS binding hooks
export default app;
module.exports = app;
