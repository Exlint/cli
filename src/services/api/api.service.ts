import { Injectable } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { Netrc } from 'netrc-parser';

import type {
	IGetComplianceResponseData,
	IGetRecommendedComplianceResponseData,
	IStoreRecommendedComplianceResponseData,
} from './interfaces/responses';
import { API_TIMEOUT } from './constants/api-timeout';

@Injectable()
export class ApiService {
	private axiosInstance = axios.create({ baseURL: __CLI_API_URL__, timeout: API_TIMEOUT });
	private unauthorizedAxiosInstance = axios.create({ baseURL: __CLI_API_URL__, timeout: API_TIMEOUT });

	constructor() {
		this.axiosInstance.interceptors.request.use(
			async (request) => {
				const netrc = new Netrc();

				await netrc.load();

				const cliToken = netrc.machines[__CLI_API_DOMAIN__]?.password;

				if (!cliToken) {
					throw new AxiosError('Missing CLI token', '401');
				}

				request.headers!['Authorization'] = `Bearer ${cliToken}`;

				return request;
			},
			(error) => Promise.reject(error),
		);
	}

	public async getComplianceData(complianceId: string) {
		const complianceDataResponse = await this.axiosInstance.get<IGetComplianceResponseData>(
			`/user/compliances/${complianceId}`,
		);

		return complianceDataResponse.data;
	}

	public async getRecommendedComplianceData(languages: string[]) {
		const complianceDataResponse =
			await this.unauthorizedAxiosInstance.post<IGetRecommendedComplianceResponseData>(
				'/user/compliances/recommended',
				{ languages },
			);

		return complianceDataResponse.data;
	}

	public async hasValidToken() {
		try {
			await this.axiosInstance.get('/user/auth/verify-token');

			return true;
		} catch {
			return false;
		}
	}

	public async storeRecommendedCompliance(languages: string[]) {
		const createdComplianceResponse =
			await this.axiosInstance.post<IStoreRecommendedComplianceResponseData>(
				'/user/compliances/add-recommended',
				{
					languages,
				},
			);

		return createdComplianceResponse.data;
	}
}
