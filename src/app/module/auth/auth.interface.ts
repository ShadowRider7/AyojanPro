import type { Role } from "../../../generated/prisma/enums";
export interface IRegisterClientPayload {
	name: string;
	email: string;
	password: string;
	client: {
		phone?: string;
		profileImage?: string;
		bio?: string;
		address?: string;
		city?: string;
		country?: string;
	};
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
