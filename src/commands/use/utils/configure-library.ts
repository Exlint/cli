import path from 'path';

import fs from 'fs-extra';

import { ILibrary } from '@/interfaces/library';
import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';

export const setConfigLibrary = async (
	projectId: string,
	libraryName: ILibrary,
	configuration: Record<string, unknown>,
) => {
	const fileName = `.${libraryName}rc.json`;
	const configFilePath = path.join(EXLINT_FOLDER_PATH, projectId, fileName);
	const configContent = { ...configuration, __EXLINT_FILES_PATTERN__: undefined };
	const writePromises = [fs.outputJson(configFilePath, configContent)];

	if ('__EXLINT_FILES_PATTERN__' in configuration) {
		const libFilesPatternFilePath = path.join(
			EXLINT_FOLDER_PATH,
			projectId,
			`.exlint-${libraryName}-pattern`,
		);

		writePromises.push(fs.outputFile(libFilesPatternFilePath, configuration['__EXLINT_FILES_PATTERN__']));
	}

	await Promise.all(writePromises);
};

export const resetConfigLibraries = async (projectId: string) => {
	const libraries = ['eslint', 'prettier', 'depcheck', 'inflint', 'stylelint'];
	const projectFolderPath = path.join(EXLINT_FOLDER_PATH, projectId);

	const removeFilesPromises = [
		...libraries.map((library) => fs.remove(path.join(projectFolderPath, `.${library}rc.json`))),
		...libraries.map((library) => fs.remove(path.join(projectFolderPath, `.exlint-${library}-pattern`))),
	];

	await Promise.all(removeFilesPromises);
};
