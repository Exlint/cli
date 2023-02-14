import path from 'node:path';

import fs from 'fs-extra';

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
		return null;
	}

	const libraryIgnorePath = path.join(projectPath, '.inflintignore');
	const isLibraryConfigured = await fs.pathExists(libraryConfigPath);

	if (!isLibraryConfigured) {
		return null;
	}

	const libraryRunOutput = await spawnLib('inflint', [
		'--config',
		libraryConfigPath,
		'--ignore-path',
		libraryIgnorePath,
	]);

	return {
		...libraryRunOutput,
		name: 'Inflint',
	};
};
