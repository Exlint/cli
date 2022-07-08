import path from 'path';

import fs from 'fs-extra';
import chalk from 'chalk';

import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';

import { spawnLib } from './spawn-lib';

export const getStylelintOutput = async (projectId: string, withFix: boolean) => {
	const libraryConfigPath = path.join(EXLINT_FOLDER_PATH, projectId, '.stylelintrc.json');
	const libraryPatternPath = path.join(EXLINT_FOLDER_PATH, projectId, '.exlint-stylelint-pattern');
	const isLibraryConfigured = await fs.pathExists(libraryConfigPath);

	if (isLibraryConfigured) {
		const libraryPattern = await fs
			.readFile(libraryPatternPath, { encoding: 'utf-8' })
			.catch(() => '**/*');

		const libraryRunOutput = await spawnLib('stylelint', [
			'--config',
			libraryConfigPath,
			libraryPattern,
			...(withFix ? ['--fix'] : []),
		]);

		return {
			output: `${chalk[libraryRunOutput.success ? 'greenBright' : 'red'].bold(
				'--- Stylelint output ---',
			)}\n\n${libraryRunOutput.output}`,
			success: libraryRunOutput.success,
		};
	}

	return {
		output: '',
		success: true,
	};
};
