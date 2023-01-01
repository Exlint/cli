import path from 'node:path';

import fs from 'fs-extra';
import chalk from 'chalk';

import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';
import { findConfigFileName } from '@/utils/config-file-name';

import { spawnLib } from './spawn-lib';

export const getInflintOutput = async (projectId: string) => {
	const projectPath = path.join(EXLINT_FOLDER_PATH, projectId);
	const projectFolderFiles = await fs.readdir(projectPath);
	let libraryConfigPath: string;

	try {
		libraryConfigPath = path.join(projectPath, findConfigFileName(projectFolderFiles, 'inflint'));
	} catch {
		return {
			output: '',
			success: true,
		};
	}

	const libraryIgnorePath = path.join(projectPath, '.inflintignore');
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
