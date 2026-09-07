export type ICreateReviewPayload = {
	rating: number;
	comment?: string;
};

export type IReviewListQuery = {
	page?: number;
	limit?: number;
};
