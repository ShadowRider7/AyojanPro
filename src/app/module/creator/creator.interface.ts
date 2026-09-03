export interface IUpdateCreatorProfileInput {
	bio?: string;
	location?: string;
	contactNumber?: string;
	experience?: number;
	hourlyRate?: number;
	isAvailable?: boolean;
	website?: string;
	githubUrl?: string;
	linkedinUrl?: string;
	behanceUrl?: string;
	dribbbleUrl?: string;
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
	category?: string;
	tools: string[];
	thumbnailUrl?: string;
	mediaUrl: string;
	publicId: string;
	externalUrl?: string;
}

export interface IUpdatePortfolioItemInput {
	title?: string;
	description?: string;
	category?: string;
	tools?: string[];
	thumbnailUrl?: string;
	mediaUrl?: string;
	publicId?: string;
	externalUrl?: string;
}
