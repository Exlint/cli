import path from 'path';

import fs from 'fs-extra';
import chalk from 'chalk';

import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';

import { spawnLib } from './spawn-lib';

export const getDepcheckOutput = async (projectId: string) => {
	const depcheckConfigPath = path.join(EXLINT_FOLDER_PATH, projectId, '.depcheckrc.json');
	const isDepcheckConfigured = await fs.pathExists(depcheckConfigPath);

	if (isDepcheckConfigured) {
		const depcheckRunOutput = await spawnLib('depcheck', ['--config', depcheckConfigPath]);

		return {
			output: `${chalk[depcheckRunOutput.success ? 'greenBright' : 'red'].bold(
				'--- Depcheck output ---',
			)}\n\n${depcheckRunOutput.output}`,
			success: depcheckRunOutput.success,
		};
	}

	return {
		output: '',
		success: true,
	};
};
