import { z } from "zod";

const emailSchema = z.string().email("Please provide a valid email address");

const passwordSchema = z
	.string()
	.min(8, "Password Must Minimum 8 Characters Long.")
	.regex(/[a-z]/, "Password must contain at least 1 Lowercase Letter")
	.regex(/[A-Z]/, "Password must contain at least 1 Uppercase Letter")
	.regex(/[0-9]/, "Password must contain at least 1 Number")
	.regex(/[^A-Za-z0-9]/, "Password must contain at least 1 Special Character");

const clientProfileSchema = z.object({
	phone: z.string().optional(),
	profileImage: z
		.string()
		.url("Invalid image URL")
		.optional()
		.or(z.literal("")), // Allows optional or empty strings
	bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
	address: z.string().optional(),
	city: z.string().optional(),
	country: z.string().optional(),
});

export const ClientRegisterZodSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Name must be at least 2 characters long")
		.max(255, "Name cannot exceed 255 characters"),
	email: emailSchema,
	password: passwordSchema,
	client: clientProfileSchema,
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
	ClientRegisterZodSchema,
	LoginZodSchema,
	VerifyEmailZodSchema,
	GoogleLoginZodSchema,
	ForgotPasswordZodSchema,
	ResetPasswordZodSchema,
};
