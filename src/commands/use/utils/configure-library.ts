import path from 'path';
import os from 'os';

import fs from 'fs-extra';

import { ILibrary } from '@/interfaces/library';
import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';
import { IPolicyConfiguration } from '@/interfaces/policy-configuration';

export const setConfigLibrary = async (
	projectId: string,
	libraryName: ILibrary,
	configuration: IPolicyConfiguration,
) => {
	const configurationFileName = `.${libraryName}rc.json`;
	const ignoreFileName = `.${libraryName}ignore`;
	const configFilePath = path.join(EXLINT_FOLDER_PATH, projectId, configurationFileName);
	const libFilesPatternFilePath = path.join(EXLINT_FOLDER_PATH, projectId, ignoreFileName);

	// Ensure the Exlint pre-configured valus are not written to configuration files (otherwise an exception will be thrown)
	const configContent = {
		...configuration,
		...(libraryName === 'stylelint' && {
			ignoreFiles: [
				...(configuration?.ignoreFiles ? configuration.ignoreFiles : []),
				...(configuration?.__EXLINT_IGNORE_FILE__ ? configuration.__EXLINT_IGNORE_FILE__ : []),
			],
		}),
		__EXLINT_FILES_PATTERN__: undefined,
		__EXLINT_IGNORE_FILE__: undefined,
	};

	const writePromises = [fs.outputJson(configFilePath, configContent)];

	// * VSCode Stylelint extension has issues with repsecting ".stylelintignore" file:
	// * https://stackoverflow.com/questions/42070748/vs-code-style-lint-ignore-directories
	if (libraryName !== 'depcheck' && libraryName !== 'stylelint') {
		writePromises.push(
			fs.outputFile(
				libFilesPatternFilePath,
				(configuration?.__EXLINT_IGNORE_FILE__ ?? []).join(os.EOL),
			),
		);
	}

	if (configuration && configuration.__EXLINT_FILES_PATTERN__) {
		const libFilesPatternFilePath = path.join(
			EXLINT_FOLDER_PATH,
			projectId,
			`.exlint-${libraryName}-pattern`,
		);

		writePromises.push(
			fs.outputFile(libFilesPatternFilePath, configuration.__EXLINT_FILES_PATTERN__.join(os.EOL)),
		);
	}

	await Promise.all(writePromises);
};

export const resetConfigLibraries = async (projectId: string) => {
	const libraries = ['eslint', 'prettier', 'depcheck', 'inflint', 'stylelint'];
	const projectFolderPath = path.join(EXLINT_FOLDER_PATH, projectId);

	const removeFilesPromises = libraries.reduce<Promise<void>[]>((final, library) => {
		return [
			...final,
			fs.remove(path.join(projectFolderPath, `.${library}rc.json`)),
			fs.remove(path.join(projectFolderPath, `.exlint-${library}-pattern`)),
			...(library !== 'depcheck' && library !== 'stylelint'
				? [fs.remove(path.join(projectFolderPath, `.${library}ignore`))]
				: []),
		];
	}, []);

	await Promise.all(removeFilesPromises);
};
