export interface IRaiseDispute {
	reason: string;
	description: string;
}

export interface IUploadEvidence {
	type?: string;
	title?: string;
	description?: string;
	mediaUrl: string;
}

// RESOLVED is intentionally excluded — that transition only happens via
// the dedicated /resolve endpoint, which also records the resolution text.
export interface IUpdateDisputeStatus {
	status: "OPEN" | "UNDER_REVIEW" | "REJECTED" | "CLOSED";
}

export interface IResolveDispute {
	resolution: string;
}
