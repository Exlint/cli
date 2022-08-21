import { ILibrary } from '@/interfaces/library';
import { IPolicyConfiguration } from '@/interfaces/policy-configuration';

export interface IGetGroupPoliciesResponse {
	id: string;
	inlinePolicies: {
		id: string;
		library: ILibrary;
		configuration: IPolicyConfiguration;
	}[];
}
