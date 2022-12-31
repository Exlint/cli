import path from 'path';

import fs from 'fs-extra';
import chalk from 'chalk';

import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';
import { findConfigFileName } from '@/utils/config-file-name';

import { spawnLib } from './spawn-lib';

export const getDepcheckOutput = async (projectId: string) => {
	const projectPath = path.join(EXLINT_FOLDER_PATH, projectId);
	const projectFolderFiles = await fs.readdir(projectPath);
	let libraryConfigPath: string;

	try {
		libraryConfigPath = path.join(projectPath, findConfigFileName(projectFolderFiles, 'depcheck'));
	} catch {
		return {
			output: '',
			success: true,
		};
	}

	const isDepcheckConfigured = await fs.pathExists(libraryConfigPath);

	if (isDepcheckConfigured) {
		const depcheckRunOutput = await spawnLib('depcheck', ['--config', libraryConfigPath]);

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
