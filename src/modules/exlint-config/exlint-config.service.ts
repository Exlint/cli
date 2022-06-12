import path from 'path';

import { Injectable } from '@nestjs/common';
import fs from 'fs-extra';

import { IExlintConfig } from './interfaces/exlint-config';

@Injectable()
export class ExlintConfigService {
	private filePath = path.join(process.cwd(), '.exlint');
	private config: IExlintConfig = {};

	public async setValues(config: IExlintConfig) {
		const newConfig = { ...this.config, config };

		await fs.outputJson(this.filePath, newConfig);
	}

	public getValue(key: keyof IExlintConfig) {
		return this.config[key];
	}
}
