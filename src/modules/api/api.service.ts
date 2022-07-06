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
		/* 		const groupDataResponse = await axios.get<IGetGroupPoliciesResponse>(
			`/user/groups/get-group/${groupId}`,
		); */

		await Promise.resolve(groupId);

		const groupDataResponse = {
			data: {
				id: 'yazif',
				policies: [
					{
						id: 'yazif',
						library: 'eslint',
						label: 'joseha',
						configuration: {
							root: true,
							env: {
								node: true,
							},
							parserOptions: {
								ecmaVersion: 12,
								sourceType: 'module',
							},
							rules: {
								'max-lines': ['error', { max: 2, skipBlankLines: true, skipComments: true }],
								'capitalized-comments': ['error', 'always'],
							},
							__EXLINT_FILES_PATTERN__: 'test.js',
						},
					},
					{
						id: 'yazif',
						library: 'inflint',
						label: 'joseha',
						configuration: {
							rules: {
								'**/*': [2, 'kebab-case'],
							},
						},
					},
					{
						id: 'yazif',
						library: 'stylelint',
						label: 'joseha',
						configuration: {
							rules: {
								'color-named': ['never'],
							},
							__EXLINT_FILES_PATTERN__: 'test.css',
						},
					},
					{
						id: 'yazif',
						library: 'prettier',
						label: 'joseha',
						configuration: {
							tabWidth: 4,
							printWidth: 110,
							useTabs: true,
							semi: true,
							singleQuote: true,
							quoteProps: 'consistent',
							trailingComma: 'all',
							bracketSpacing: true,
							arrowParens: 'always',
							bracketSameLine: false,
						},
					},
				],
			},
		};

		return groupDataResponse.data as IGetGroupPoliciesResponse;
	}

	public async hasValidToken() {
		try {
			//axios.get('/user/auth/verify-token');
			await Promise.resolve();

			return true;
		} catch {
			return false;
		}
	}
}
