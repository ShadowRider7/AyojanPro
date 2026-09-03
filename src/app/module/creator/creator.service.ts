import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import type { IUpdateCreatorProfileInput } from "./creator.interface";

const updateCreatorProfile = async (
	payload: IUpdateCreatorProfileInput,
	user: RequestUser,
) => {
	const existingCreator = await prisma.creator.findUnique({
		where: { userId: user.userId },
	});

	if (!existingCreator) {
		throw new AppError(httpStatus.NOT_FOUND, "Creator Profile Not Found");
	}

	const updatedCreator = await prisma.creator.update({
		where: { id: existingCreator.id },
		data: payload,
	});

	return updatedCreator;
};

export const creatorService = {
	updateCreatorProfile,
};
