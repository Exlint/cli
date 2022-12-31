import { Injectable } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { Netrc } from 'netrc-parser';

import { ConfigService } from '../config/config.service';
import type { IGetGroupResponseData } from './interfaces/responses';

@Injectable()
export class ApiService {
	private axiosInstance = axios.create({ baseURL: this.configService.getValue('API_URL') });

	constructor(private readonly configService: ConfigService) {
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

	public async getGroupData(groupId: string) {
		const groupDataResponse = await this.axiosInstance.get<IGetGroupResponseData>(
			`/user/groups/${groupId}`,
		);

		return groupDataResponse.data;
	}

	public async hasValidToken() {
		try {
			await this.axiosInstance.get('/user/auth/verify-token');

			return true;
		} catch {
			return false;
		}
	}
}
