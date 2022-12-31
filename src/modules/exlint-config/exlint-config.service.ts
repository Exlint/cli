import path from 'path';

import { Injectable } from '@nestjs/common';
import fs from 'fs-extra';

import { EXLINT_FILE_NAME } from '@/models/exlint-folder';

import type { IExlintConfig } from './interfaces/exlint-config';

@Injectable()
export class ExlintConfigService {
	private filePath = path.join(process.cwd(), EXLINT_FILE_NAME);
	private config: IExlintConfig = {};

	public async init() {
		const configFromFile = await fs.readJson(this.filePath).catch(() => ({}));

		this.config = configFromFile;
	}

	public async setValues(config: IExlintConfig) {
		const newConfig = { ...this.config, ...config };

		await fs.outputJson(this.filePath, newConfig);
	}

	public getValue(key: keyof IExlintConfig) {
		return this.config[key];
	}
}
