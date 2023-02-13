import path from 'path';

import fs from 'fs-extra';

import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';
import { findConfigFileName } from '@/utils/config-file-name';

import { spawnLib } from './spawn-lib';

export const getStylelintOutput = async (projectId: string, withFix: boolean) => {
	const projectPath = path.join(EXLINT_FOLDER_PATH, projectId);
	const projectFolderFiles = await fs.readdir(projectPath);
	let libraryConfigPath: string;

	try {
		libraryConfigPath = path.join(projectPath, findConfigFileName(projectFolderFiles, 'stylelint'));
	} catch {
		return null;
	}

	const libraryPatternPath = path.join(projectPath, '.exlint-stylelint-pattern');
	const libraryIgnorePath = path.join(projectPath, '.stylelintignore');
	const isLibraryConfigured = await fs.pathExists(libraryConfigPath);

	if (!isLibraryConfigured) {
		return null;
	}

	const libraryPattern = await fs.readFile(libraryPatternPath, { encoding: 'utf-8' }).catch(() => '**/*');
	const splittedLibraryPattern = libraryPattern.split('\n');
	const finalLibraryPattern = splittedLibraryPattern.map((pattern) => JSON.stringify(pattern)).join(' ');

	const libraryRunOutput = await spawnLib('stylelint', [
		'--config',
		libraryConfigPath,
		finalLibraryPattern,
		'--ignore-path',
		libraryIgnorePath,
		...(withFix ? ['--fix'] : []),
	]);

	return {
		...libraryRunOutput,
		name: 'Stylelint',
	};
};
