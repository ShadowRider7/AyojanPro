import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { ApplicationStatus, Role } from "../../generated/prisma/enums";
import config from "../config";
import { prisma } from "../lib/prisma";
import { AppError } from "./AppError";

export const seedTesterAdmin = async () => {
	try {
		const isTesterAdminExist = await prisma.user.findUnique({
			where: {
				email: config.tester_admin_email,
			},
		});

		if (isTesterAdminExist) {
			console.log("Tester Admin Already Exists!");
			return;
		}

		const name = config.tester_admin_name;
		const email = config.tester_admin_email;
		const password = config.tester_admin_password;

		if (!name || !email || !password) {
			throw new AppError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"Tester Admin Name , Email, Password Missing In Env File!!!",
			);
		}

		const hashedPassword = await bcrypt.hash(
			password,
			Number(config.bcrypt_salt_rounds),
		);

		const testerAdmin = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				role: Role.ADMIN,
				emailVerified: true,
			},
		});

		console.log("Tester Admin Created : ", testerAdmin);
	} catch (error) {
		console.log("Error Seeding Tester Admin : ", error);

		await prisma.user.delete({
			where: {
				email: config.tester_admin_email,
			},
		});
	}
};

// create tester doctor

export const seedTesterClient = async () => {
	// 1. Move validation to the top to avoid running queries with missing inputs
	const name = config.tester_client_name;
	const email = config.tester_client_email;
	const password = config.tester_client_password;

	if (!name || !email || !password) {
		throw new AppError(
			httpStatus.INTERNAL_SERVER_ERROR,
			"Tester Client Name, Email, Password Missing In Env File!!!",
		);
	}

	try {
		// 2. Check if user already exists
		const isTesterClientExist = await prisma.user.findUnique({
			where: { email },
		});

		if (isTesterClientExist) {
			console.log(" Tester Client Already Exists!");
			return;
		}

		// 3. Hash password
		const hashedPassword = await bcrypt.hash(
			password,
			Number(config.bcrypt_salt_rounds) || 10,
		);

		// 4. Create User and Client records atomically
		const testerClient = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				role: Role.CLIENT,
				emailVerified: true,
				client: {
					create: {
						bio: "Automated test client account.",
					},
				},
			},
		});

		console.log(" Tester Client Created : ", testerClient);
	} catch (error) {
		console.error(" Error Seeding Tester Client : ", error);
		await prisma.user.delete({
			where: {
				email: config.tester_client_email,
			},
		});
	}
};

export const seedTesterProfessional = async () => {
	const name = config.tester_professional_name;
	const email = config.tester_professional_email;
	const password = config.tester_professional_password;

	if (!name || !email || !password) {
		console.error(
			" Seeding skipped: Missing Tester Professional credentials in environment config.",
		);
		return;
	}

	try {
		const isTesterProfessionalExist = await prisma.user.findUnique({
			where: { email },
		});

		if (isTesterProfessionalExist) {
			console.log(" Tester Professional Already Exists!");
			return;
		}

		const hashedPassword = await bcrypt.hash(
			password,
			Number(config.bcrypt_salt_rounds) || 10,
		);

		const testerProfessional = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				role: Role.PROFESSIONAL,
				emailVerified: true,
				professional: {
					create: {
						name,
						email,
						professionalTitle: "QA Tester / Software Professional", // Required by schema
						experienceYears: 2, // Corrected from "experience" to match schema
						status: ApplicationStatus.APPROVED, // Overriding the default PENDING status for a functional test user
					},
				},
			},
		});

		console.log("Tester Professional Created: ", testerProfessional);
	} catch (error) {
		console.error("Error Seeding Tester Professional: ", error);
		await prisma.user.delete({
			where: {
				email: config.tester_professional_email,
			},
		});
	}
};
