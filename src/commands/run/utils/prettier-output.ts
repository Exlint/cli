import path from 'path';

import fs from 'fs-extra';
import chalk from 'chalk';

import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';

import { spawnLib } from './spawn-lib';

export const getPrettierOutput = async (projectId: string, withFix: boolean) => {
	const libraryConfigPath = path.join(EXLINT_FOLDER_PATH, projectId, '.prettierrc.json');
	const libraryPatternPath = path.join(EXLINT_FOLDER_PATH, projectId, '.exlint-prettier-pattern');
	const libraryIgnorePath = path.join(EXLINT_FOLDER_PATH, projectId, '.prettierignore');
	const isLibraryConfigured = await fs.pathExists(libraryConfigPath);

	if (isLibraryConfigured) {
		const libraryPattern = await fs
			.readFile(libraryPatternPath, { encoding: 'utf-8' })
			.catch(() => '**/*');

		const libraryRunOutput = await spawnLib('prettier', [
			'--config',
			libraryConfigPath,
			libraryPattern,
			'--check',
			'--ignore-unknown',
			'--ignore-path',
			libraryIgnorePath,
			...(withFix ? ['--write'] : []),
		]);

		return {
			output: `${chalk[libraryRunOutput.success ? 'greenBright' : 'red'].bold(
				'--- Prettier output ---',
			)}\n\n${libraryRunOutput.output}`,
			success: libraryRunOutput.success,
		};
	}

	return {
		output: '',
		success: true,
	};
};
