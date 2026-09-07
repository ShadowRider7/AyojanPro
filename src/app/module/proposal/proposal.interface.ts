export interface ICreateProposal {
	message?: string;
	items: {
		eventServiceRequirementId: string;
		professionalServiceId: string;
		proposedAmount: number | string;
		currency?: string;
		proposedStartAt: Date | string;
		proposedEndAt: Date | string;
	}[];
}
