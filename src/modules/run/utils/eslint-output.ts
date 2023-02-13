import path from 'node:path';

import fs from 'fs-extra';

import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';
import { findConfigFileName } from '@/utils/config-file-name';

import { spawnLib } from './spawn-lib';

export const getEslintOutput = async (projectId: string, withFix: boolean) => {
	const projectPath = path.join(EXLINT_FOLDER_PATH, projectId);
	const projectFolderFiles = await fs.readdir(projectPath);
	let libraryConfigPath: string;

	try {
		libraryConfigPath = path.join(projectPath, findConfigFileName(projectFolderFiles, 'eslint'));
	} catch {
		return null;
	}

	const libraryPatternPath = path.join(projectPath, '.exlint-eslint-pattern');
	const libraryIgnorePath = path.join(projectPath, '.eslintignore');
	const isLibraryConfigured = await fs.pathExists(libraryConfigPath);

	if (!isLibraryConfigured) {
		return null;
	}

	const libraryPattern = await fs.readFile(libraryPatternPath, { encoding: 'utf-8' }).catch(() => '**/*');
	const splittedLibraryPattern = libraryPattern.split('\n');
	const finalLibraryPattern = splittedLibraryPattern.map((pattern) => JSON.stringify(pattern)).join(' ');

	const libraryRunOutput = await spawnLib('eslint', [
		'--no-error-on-unmatched-pattern',
		'--config',
		libraryConfigPath,
		finalLibraryPattern,
		'--ignore-path',
		libraryIgnorePath,
		...(withFix ? ['--fix'] : []),
	]);

	return {
		...libraryRunOutput,
		name: 'ESLint',
	};
};
