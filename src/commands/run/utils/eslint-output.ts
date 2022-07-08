import path from 'path';

import fs from 'fs-extra';
import chalk from 'chalk';

import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';

import { spawnLib } from './spawn-lib';

export const getEslintOutput = async (projectId: string, withFix: boolean) => {
	const libraryConfigPath = path.join(EXLINT_FOLDER_PATH, projectId, '.eslintrc.json');
	const libraryPatternPath = path.join(EXLINT_FOLDER_PATH, projectId, '.exlint-eslint-pattern');
	const libraryIgnorePath = path.join(EXLINT_FOLDER_PATH, projectId, '.eslintignore');
	const isLibraryConfigured = await fs.pathExists(libraryConfigPath);

	if (isLibraryConfigured) {
		const libraryPattern = await fs
			.readFile(libraryPatternPath, { encoding: 'utf-8' })
			.catch(() => '**/*');

		const libraryRunOutput = await spawnLib('eslint', [
			'--config',
			libraryConfigPath,
			libraryPattern,
			'--ignore-path',
			libraryIgnorePath,
			...(withFix ? ['--fix'] : []),
		]);

		return {
			output: `${chalk[libraryRunOutput.success ? 'greenBright' : 'red'].bold(
				'--- ESLint output ---',
			)}\n\n${libraryRunOutput.output}`,
			success: libraryRunOutput.success,
		};
	}

	return {
		output: '',
		success: true,
	};
};
