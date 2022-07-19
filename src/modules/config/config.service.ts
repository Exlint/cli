import { Injectable } from '@nestjs/common';
import { IConfig } from './config.interface';

@Injectable()
export class ConfigService {
	private config: IConfig = {
		API_URL: 'http://localhost:5000',
		DASHBOARD_URL: 'http://localhost:8080',
	};

	public getValue(key: keyof IConfig) {
		return this.config[key];
	}
}
