import path from 'node:path';

import fs from 'fs-extra';

import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';
import { findConfigFileName } from '@/utils/config-file-name';

import { spawnLib } from './spawn-lib';

export const getPrettierOutput = async (projectId: string, withFix: boolean) => {
	const projectPath = path.join(EXLINT_FOLDER_PATH, projectId);
	const projectFolderFiles = await fs.readdir(projectPath);
	let libraryConfigPath: string;

	try {
		libraryConfigPath = path.join(projectPath, findConfigFileName(projectFolderFiles, 'prettier'));
	} catch {
		return null;
	}

	const libraryPatternPath = path.join(projectPath, '.exlint-prettier-pattern');
	const libraryIgnorePath = path.join(projectPath, '.prettierignore');

	const isLibraryConfigured = await fs.pathExists(libraryConfigPath);

	if (!isLibraryConfigured) {
		return null;
	}

	const libraryPattern = await fs.readFile(libraryPatternPath, { encoding: 'utf-8' }).catch(() => '**/*');

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
		...libraryRunOutput,
		name: 'Prettier',
	};
};
