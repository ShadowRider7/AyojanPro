import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { Role } from "../../generated/prisma/enums";
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
	try {
		const isTesterClientExist = await prisma.user.findUnique({
			where: {
				email: config.tester_client_email,
			},
		});

		if (isTesterClientExist) {
			console.log("Tester Client Already Exists!");
			return;
		}

		const name = config.tester_client_name;
		const email = config.tester_client_email;
		const password = config.tester_client_password;

		if (!name || !email || !password) {
			throw new AppError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"Tester Client Name , Email, Password Missing In Env File!!!",
			);
		}

		const hashedPassword = await bcrypt.hash(
			password,
			Number(config.bcrypt_salt_rounds),
		);

		const testerClient = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				role: Role.CLIENT,
				emailVerified: true,
				client: {
					create: {
						email,
						name,
						companyName: "sadhin bangla",
					},
				},
			},
		});

		console.log("Tester Client Created : ", testerClient);
	} catch (error) {
		console.log("Error Seeding Tester Client : ", error);

		await prisma.user.delete({
			where: {
				email: config.tester_client_email,
			},
		});
	}
};

export const seedTesterProfessional = async () => {
	try {
		const isTesterProfessionalExist = await prisma.user.findUnique({
			where: {
				email: config.tester_professional_email,
			},
		});

		if (isTesterProfessionalExist) {
			console.log("Tester Professional Already Exists!");
			return;
		}

		const name = config.tester_professional_name;
		const email = config.tester_professional_email;
		const password = config.tester_professional_password;

		if (!name || !email || !password) {
			throw new AppError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"Tester Professional Name , Email, Password Missing In Env File!!!",
			);
		}

		const hashedPassword = await bcrypt.hash(
			password,
			Number(config.bcrypt_salt_rounds),
		);

		const testerProfessional = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				role: Role.CREATOR,
				emailVerified: true,
				professional: {
					create: {
						email,
						name,
						experience: 2,
					},
				},
			},
		});

		console.log("Tester Professional Created : ", testerProfessional);
	} catch (error) {
		console.log("Error Seeding Tester Professional : ", error);

		await prisma.user.delete({
			where: {
				email: config.tester_professional_email,
			},
		});
	}
};
