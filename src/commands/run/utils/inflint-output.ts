import path from 'path';

import fs from 'fs-extra';
import chalk from 'chalk';

import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';

import { spawnLib } from './spawn-lib';

export const getInflintOutput = async (projectId: string) => {
	const libraryConfigPath = path.join(EXLINT_FOLDER_PATH, projectId, '.inflintrc.json');
	const libraryIgnorePath = path.join(EXLINT_FOLDER_PATH, projectId, '.inflintignore');
	const isLibraryConfigured = await fs.pathExists(libraryConfigPath);

	if (isLibraryConfigured) {
		const libraryRunOutput = await spawnLib('@exlint.io/inflint', [
			'--config',
			libraryConfigPath,
			'--ignore-path',
			libraryIgnorePath,
		]);

		return {
			output: `${chalk[libraryRunOutput.success ? 'greenBright' : 'red'].bold(
				'--- Inflint output ---',
			)}\n\n${libraryRunOutput.output}`,
			success: libraryRunOutput.success,
		};
	}

	return {
		output: '',
		success: true,
	};
};
