import { Injectable } from '@nestjs/common';

import { IConfig } from './config.interface';

@Injectable()
export class ConfigService {
	private config: IConfig = {
		API_URL: __CLI_API_URL__,
		DASHBOARD_URL: __DASHBOARD_URL__,
	};

	public getValue(key: keyof IConfig) {
		return this.config[key];
	}
}
