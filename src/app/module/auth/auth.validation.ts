import { z } from "zod";

const emailSchema = z.email("Please provide a valid email address");

const passwordSchema = z
	.string()
	.min(8, "Password Must Minimum 8 Characters Long.")
	.regex(/[a-z]/, "Password must contain atleast 1 Lowercase Letter")
	.regex(/[A-Z]/, "Password must contain atleast 1 Uppercase Letter")
	.regex(/[0-9]/, "Password must contain atleast 1 Number")
	.regex(/[^A-Za-z0-9]/, "Password must contain atleast 1 Special Character");

export const RoleEnum = z.enum(["CLIENT", "CREATOR"]);

const RegisterZodSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Name must be at least 2 characters long")
		.max(255, "Name cannot exceed 255 characters"),

	email: emailSchema,
	password: passwordSchema,
	role: RoleEnum,
});

const LoginZodSchema = z.object({
	email: emailSchema,

	password: z.string().min(1, "Password is required"),
});

const VerifyEmailZodSchema = z.object({
	email: emailSchema,

	otp: z.string().regex(/^\d{6}$/, "OTP must be a 6-digit number"),
});

const GoogleLoginZodSchema = z.object({
	idToken: z.string().min(1, "Google ID token is required"),
	role: RoleEnum,
});

const ForgotPasswordZodSchema = z.object({
	email: emailSchema,
});

const ResetPasswordZodSchema = z.object({
	email: emailSchema,

	otp: z.string().regex(/^\d{6}$/, "OTP must be a 6-digit number"),

	newPassword: passwordSchema,

	confirmPassword: z.string().min(1, "Confirm password is required"),
});

export const AuthValidation = {
	RegisterZodSchema,
	LoginZodSchema,
	VerifyEmailZodSchema,
	GoogleLoginZodSchema,
	ForgotPasswordZodSchema,
	ResetPasswordZodSchema,
};
