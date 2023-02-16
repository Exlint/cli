import type { IPolicyServer, IRecommendedPolicyServer } from '@/interfaces/policy';

export type IGetComplianceResponseData = IPolicyServer[];

export type IGetRecommendedComplianceResponseData = IRecommendedPolicyServer[];

export interface IStoreRecommendedComplianceResponseData {
	readonly complianceId: string;
}
