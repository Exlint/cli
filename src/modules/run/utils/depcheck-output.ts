import path from 'node:path';

import fs from 'fs-extra';

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
		return null;
	}

	const isDepcheckConfigured = await fs.pathExists(libraryConfigPath);

	if (!isDepcheckConfigured) {
		return null;
	}

	const depcheckRunOutput = await spawnLib('depcheck', ['--config', libraryConfigPath]);

	return {
		...depcheckRunOutput,
		name: 'Depcheck',
	};
};
