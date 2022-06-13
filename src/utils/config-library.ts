import path from 'path';

import fs from 'fs-extra';

import { ILibrary } from '@/interfaces/library';
import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';

export const setConfigLibrary = async (libraryName: ILibrary, configuration: Record<string, unknown>) => {
	const fileName = `.${libraryName}rc.json`;
	const configFilePath = path.join(EXLINT_FOLDER_PATH, fileName);
	const configContent = JSON.stringify({ ...configuration, __EXLINT_FILES_PATTERN__: undefined });

	const writePromises = [fs.outputJson(configFilePath, configContent)];

	if ('__EXLINT_FILES_PATTERN__' in configuration) {
		const libFilesPatternFilePath = path.join(EXLINT_FOLDER_PATH, `.exlint-${libraryName}-pattern`);

		writePromises.push(fs.outputFile(libFilesPatternFilePath, configuration['__EXLINT_FILES_PATTERN__']));
	}

	await Promise.all(writePromises);
};
