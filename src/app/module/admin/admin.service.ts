import httpStatus from "http-status";
import { Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import type { IUpdateUserStatus } from "./admin.interface";

const listUsers = async (filters: {
	role?: Role;
	status?: string;
	search?: string;
}) => {
	return prisma.user.findMany({
		where: {
			isDeleted: false,
			...(filters.role ? { role: filters.role } : {}),
			...(filters.status ? { status: filters.status as never } : {}),
			...(filters.search
				? {
						OR: [
							{ name: { contains: filters.search, mode: "insensitive" } },
							{ email: { contains: filters.search, mode: "insensitive" } },
						],
					}
				: {}),
		},
		include: { client: true, professional: true },
		orderBy: { createdAt: "desc" },
	});
};

const listEvents = async (filters: { status?: string }) => {
	return prisma.event.findMany({
		where: {
			isDeleted: false,
			...(filters.status ? { status: filters.status as never } : {}),
		},
		include: { client: { include: { user: true } }, serviceRequirements: true },
		orderBy: { createdAt: "desc" },
	});
};

const listContracts = async (filters: { status?: string }) => {
	return prisma.contract.findMany({
		where: filters.status ? { status: filters.status as never } : undefined,
		include: {
			client: true,
			professional: true,
			event: true,
			eventServiceRequirement: true,
			professionalService: true,
			payments: true,
		},
		orderBy: { createdAt: "desc" },
	});
};

const listPayments = async (filters: { status?: string; stage?: string }) => {
	return prisma.payment.findMany({
		where: {
			...(filters.status ? { status: filters.status as never } : {}),
			...(filters.stage ? { stage: filters.stage as never } : {}),
		},
		include: { contract: true, client: true },
		orderBy: { createdAt: "desc" },
	});
};

/**
 * Activates, suspends, or blocks a user account. Guards against locking
 * out other admins by mistake and against an admin accidentally changing
 * their own status through this endpoint.
 */
const updateUserStatus = async (
	targetUserId: string,
	payload: IUpdateUserStatus,
	adminUser: RequestUser,
) => {
	if (targetUserId === adminUser.userId) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"You cannot change your own account status here",
		);
	}

	const targetUser = await prisma.user.findUnique({
		where: { id: targetUserId },
	});

	if (!targetUser || targetUser.isDeleted) {
		throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
	}

	if (targetUser.role === Role.ADMIN) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Admin accounts cannot be suspended or blocked through this endpoint",
		);
	}

	return prisma.user.update({
		where: { id: targetUserId },
		data: { status: payload.status },
	});
};

export const adminService = {
	listUsers,
	listEvents,
	listContracts,
	listPayments,
	updateUserStatus,
};
