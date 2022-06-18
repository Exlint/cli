import path from 'path';

import fs from 'fs-extra';

import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';
import { ILibrary } from '@/interfaces/library';

import { spawnLib } from './spawn-lib';

const getDepcheckOutput = async (projectId: string) => {
	const depcheckConfigFileName = '.depcheckrc.json';
	const depcheckConfigPath = path.join(EXLINT_FOLDER_PATH, projectId, depcheckConfigFileName);

	const isDepcheckConfigured = await fs.pathExists(depcheckConfigPath);

	if (isDepcheckConfigured) {
		const depcheckRunOutput = await spawnLib(projectId, 'depcheck', [
			'-c',
			`./${depcheckConfigFileName}`,
		]);

		return depcheckRunOutput;
	}

	return '';
};

const getLibraryOutput = async (projectId: string, library: ILibrary) => {
	const libraryConfigFileName = `.${library}rc.json`;
	const libraryConfigPath = path.join(EXLINT_FOLDER_PATH, projectId, libraryConfigFileName);
	const libraryPatternPath = path.join(EXLINT_FOLDER_PATH, projectId, `.exlint-${library}-pattern`);

	const [isLibraryConfigured, libraryPattern] = await Promise.all([
		fs.pathExists(libraryConfigPath),
		fs.readFile(libraryPatternPath, { encoding: 'utf-8' }).catch(() => '**/*'),
	]);

	if (isLibraryConfigured) {
		const libraryRunOutput = await spawnLib(projectId, library, [
			'-c',
			`./${libraryConfigFileName}`,
			libraryPattern,
		]);

		return libraryRunOutput;
	}

	return '';
};

export const getLibsOutput = async (projectId: string) => {
	const librariesOutput = await Promise.all([
		getDepcheckOutput(projectId),
		getLibraryOutput(projectId, 'eslint'),
		getLibraryOutput(projectId, 'inflint'),
		getLibraryOutput(projectId, 'prettier'),
		getLibraryOutput(projectId, 'stylelint'),
	]);

	return librariesOutput.join('\n\n');
};
