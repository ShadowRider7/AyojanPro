export interface IUpdateCreatorProfileInput {
	name?: string;
	bio?: string | null;
	location?: string | null;
	contactNumber?: string | null;
	experience?: number;
	hourlyRate?: number | null;
	isAvailable?: boolean;
	website?: string | null;
	githubUrl?: string | null;
	linkedinUrl?: string | null;
	behanceUrl?: string | null;
	dribbbleUrl?: string | null;
}
