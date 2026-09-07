import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { notificationService } from "./notification.service";

const listNotifications = catchAsync(async (req, res) => {
	const isReadParam = req.query.isRead as string | undefined;
	const notifications = await notificationService.listNotifications(req.user!, {
		isRead: isReadParam === undefined ? undefined : isReadParam === "true",
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Notifications retrieved successfully",
		data: notifications,
	});
});

const markAsRead = catchAsync(async (req, res) => {
	const notification = await notificationService.markAsRead(
		req.params.id as string,
		req.user!,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Notification marked as read",
		data: notification,
	});
});

const markAllAsRead = catchAsync(async (req, res) => {
	const result = await notificationService.markAllAsRead(req.user!);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "All notifications marked as read",
		data: result,
	});
});

export const notificationController = {
	listNotifications,
	markAsRead,
	markAllAsRead,
};
