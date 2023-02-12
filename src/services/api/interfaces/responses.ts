import type { IPolicyServer, IRecommendedPolicyServer } from '@/interfaces/policy';

export type IGetGroupResponseData = IPolicyServer[];

export type IGetRecommendedComplianceResponseData = IRecommendedPolicyServer[];

export interface IStoreRecommendedComplianceResponseData {
	readonly groupId: string;
}
