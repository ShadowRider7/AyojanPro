export interface IProjectCreate {
	title: string;
	description: string;
	budget: number;
	deadline: Date | string;
	location?: string;
	category?: string;
	requiredServices: string[];
}
