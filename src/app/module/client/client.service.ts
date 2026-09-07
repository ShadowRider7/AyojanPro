import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import type { IUpdateClientProfileInput } from "./client.interface";

const updateClientProfile = async (
	payload: IUpdateClientProfileInput,
	user: RequestUser,
) => {
	const existingClient = await prisma.client.findUnique({
		where: { userId: user.userId },
	});

	if (!existingClient) {
		throw new AppError(httpStatus.NOT_FOUND, "Client Profile Not Found");
	}

	const updatedClient = await prisma.client.update({
		where: { id: existingClient.id },
		data: payload,
	});

	return updatedClient;
};

export const clientService = {
	updateClientProfile,
};
