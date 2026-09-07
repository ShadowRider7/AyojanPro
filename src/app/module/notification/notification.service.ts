import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";

const listNotifications = async (
	user: RequestUser,
	filters: { isRead?: boolean },
) => {
	return prisma.notification.findMany({
		where: {
			userId: user.userId,
			...(filters.isRead !== undefined ? { isRead: filters.isRead } : {}),
		},
		orderBy: { createdAt: "desc" },
	});
};

const markAsRead = async (notificationId: string, user: RequestUser) => {
	const notification = await prisma.notification.findUnique({
		where: { id: notificationId },
	});

	if (!notification) {
		throw new AppError(httpStatus.NOT_FOUND, "Notification Not Found");
	}

	if (notification.userId !== user.userId) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"This notification does not belong to you",
		);
	}

	if (notification.isRead) {
		return notification;
	}

	return prisma.notification.update({
		where: { id: notificationId },
		data: { isRead: true },
	});
};

const markAllAsRead = async (user: RequestUser) => {
	const result = await prisma.notification.updateMany({
		where: { userId: user.userId, isRead: false },
		data: { isRead: true },
	});

	return { updatedCount: result.count };
};

export const notificationService = {
	listNotifications,
	markAsRead,
	markAllAsRead,
};
