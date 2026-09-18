import type { Payment } from "../../../generated/prisma/client";

export type IInitiatePaymentResult = {
	paymentUrl: string;
};

export type IBkashCallbackResult = {
	redirectUrl: string;
};

export type IContractPaymentsResult = Payment[];
