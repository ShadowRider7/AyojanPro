import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import type { IProjectCreate } from "./project.interface";

const createProject = async (payload: IProjectCreate, user: RequestUser) => {
	const existingClient = await prisma.client.findUnique({
		where: { userId: user.userId },
	});

	if (!existingClient) {
		throw new AppError(httpStatus.NOT_FOUND, "Client Profile Not Found");
	}
	const clientId = existingClient.id;
	const {
		budget,
		deadline,
		description,
		requiredServices,
		title,
		category,
		location,
	} = payload;

	const createdProject = await prisma.project.create({
		data: {
			budget,
			deadline,
			description,
			requiredServices,
			title,
			category,
			location,
			clientId,
		},
		include: {
			client: true,
		},
	});

	return createdProject;
};

export const projectService = {
	createProject,
};
