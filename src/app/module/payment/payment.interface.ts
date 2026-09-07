import type { Payment } from "../../../generated/prisma/client";

export type IInitiatePaymentResult = {
	paymentUrl: string;
};

export type IBkashCallbackQuery = {
	paymentID?: string;
	status?: string;
	[key: string]: unknown;
};

export type IBkashCallbackResult = {
	redirectUrl: string;
};

export type IContractPaymentsResult = Payment[];
