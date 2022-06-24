import { ILibrary } from '@/interfaces/library';

export interface IGetGroupPoliciesResponse {
	id: string;
	policies: {
		id: string;
		library: ILibrary;
		label: string;
		configuration: Record<string, unknown> | null;
	}[];
}