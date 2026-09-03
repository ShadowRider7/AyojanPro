import type { Role } from "../../../generated/prisma/enums";
export interface IRegisterPayload {
	name: string;
	email: string;
	password: string;
	role: "CLIENT" | "CREATOR";
}

export interface ILoginUserPayload {
	email: string;
	password: string;
}

export interface IRequestUser {
	userId: string;
	email: string;
	name: string;
	role: Role;
}

export interface IGoogleLoginPayload {
	idToken: string;
	role: "CLIENT" | "CREATOR";
}

export interface IVerifyEmailPayload {
	email: string;
	otp: string;
}

export interface IForgotPasswordPayload {
	email: string;
}

export interface IResetPasswordPayload {
	email: string;
	newPassword: string;
	otp: string;
}
