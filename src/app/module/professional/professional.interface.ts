import type { ApplicationStatus } from "../../../generated/prisma/enums";

export interface SkillPayload {
	name: string;
	description?: string;
}
export interface ProfessionalSkillPayload {
	skill: SkillPayload;
}
export interface IServicePayload {
	name: string;
	description?: string;
	pricingNote?: string;
	minimumPrice?: number;
	maximumPrice?: number;
}

export interface IExperiencePayload {
	title: string;
	description?: string;
	organization?: string;
	startDate?: string | Date;
	endDate?: string | Date;
}

export interface IApplyAsProfessionalPayload {
	user: {
		name: string;
		email: string;
	};
	professional: {
		phone?: string;
		address?: string;
		city?: string;
		country?: string;
		professionalTitle: string;
		bio?: string;
		experienceYears: number;
	};
}
export interface IVerifyProfessionalEmailPayload {
	email: string;
	otp: string;
}
export interface IApproveDoctorPayload {
	professionalId: string;
	status: ApplicationStatus;
	rejectionReason: string;
}

export interface IUpdateProfessionalProfileInput {
	professionalTitle?: string;
	bio?: string;
	phone?: string;
	address?: string;
	city?: string;
	country?: string;
	experienceYears?: number;
	additionalFiles?: any;
}

export interface ICreateService {
	name: string;
	description?: string;
}
export interface IUpdateService {
	name?: string;
	description?: string;
}

export interface ICreatePortfolioItemInput {
	title: string;
	description?: string;
	eventType?: string;
	workDays: string;
	mediaUrl: string;
	publicId: string;
	externalUrl?: string;
}

export interface IUpdatePortfolioItemInput {
	title: string;
	description?: string;
	eventType?: string;
	workDays: string;
	mediaUrl: string;
	publicId: string;
	externalUrl?: string;
}
