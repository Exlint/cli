import { Injectable } from '@nestjs/common';
import axios from 'axios';
import keytar from 'keytar';

import { ConfigService } from '../config/config.service';
import { IGetGroupPoliciesResponse } from './interfaces/responses';

@Injectable()
export class ApiService {
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

	private axiosInstance = axios.create({ baseURL: this.configService.getValue('API_URL') });

	public async getGroupData(groupId: string) {
		const groupDataResponse = await axios.get<IGetGroupPoliciesResponse>(`/groups/${groupId}`);

		return groupDataResponse.data;
	}
}
