import { Injectable } from '@nestjs/common';
import { IConfig } from './config.interface';

@Injectable()
export class ConfigService {
	private _config: IConfig = {
		API_URL: 'https://api.exlint.io',
	};

	public getValue(key: keyof IConfig) {
		return this._config[key];
	}
}
