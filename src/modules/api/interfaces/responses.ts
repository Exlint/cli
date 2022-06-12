export interface IGetGroupPoliciesResponse {
	id: string;
	policies: {
		id: string;
		libraryName: string;
		label: string;
		configuration: Record<string, unknown> | null;
	}[];
}
