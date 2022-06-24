import { Injectable } from '@nestjs/common';
import { IConfig } from './config.interface';

@Injectable()
export class ConfigService {
	private config: IConfig = {
		API_URL: 'https://www.api.exlint.io',
		DASHBOARD_URL: 'https://www.app.exlint.io',
	};

	public getValue(key: keyof IConfig) {
		return this.config[key];
	}
}
