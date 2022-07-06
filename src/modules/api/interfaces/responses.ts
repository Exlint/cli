import { ILibrary } from '@/interfaces/library';
import { IPolicyConfiguration } from '@/interfaces/policy-configuration';

export interface IGetGroupPoliciesResponse {
	id: string;
	policies: {
		id: string;
		library: ILibrary;
		label: string;
		configuration: IPolicyConfiguration;
	}[];
}
