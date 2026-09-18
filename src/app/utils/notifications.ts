import type { Prisma } from "../../generated/prisma/client";
import type { NotificationType } from "../../generated/prisma/enums";

interface NotificationPayload {
	userId: string;
	title: string;
	type: NotificationType;
	message: string;
}

type TxClient = Prisma.TransactionClient;

export const createNotifications = async (
	tx: TxClient,
	notifications: NotificationPayload[],
) => {
	if (notifications.length === 0) return;

	await tx.notification.createMany({
		data: notifications,
	});
};
