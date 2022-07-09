import { Injectable } from '@nestjs/common';
import axios from 'axios';
import keytar from 'keytar';

import { ConfigService } from '../config/config.service';
import type { IGetGroupPoliciesResponse } from './interfaces/responses';

@Injectable()
export class ApiService {
	private axiosInstance = axios.create({ baseURL: this.configService.getValue('API_URL') });

	constructor(private readonly configService: ConfigService) {
		this.axiosInstance.interceptors.request.use(
			async (request) => {
				const userToken = await keytar.findPassword('exlint');

				request.headers!['Authorization'] = `Bearer ${userToken}`;

				return request;
			},
			(error) => Promise.reject(error),
		);
	}

	public async getGroupData(groupId: string) {
		const groupDataResponse = await axios.get<IGetGroupPoliciesResponse>(
			`/user/groups/get-group/${groupId}`,
		);

		return groupDataResponse.data as IGetGroupPoliciesResponse;
	}

	public async hasValidToken() {
		try {
			await axios.get('/user/auth/verify-token');

			return true;
		} catch {
			return false;
		}
	}
}
