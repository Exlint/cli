import path from 'node:path';
import os from 'node:os';

import fs from 'fs-extra';

import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';
import { IPolicyServer } from '@/interfaces/policy';
import { getFileNameExtension } from '@/utils/file-name-extension';

export const setConfigLibrary = async (groupId: string, policy: IPolicyServer) => {
	const configurationData = policy.isFormConfiguration
		? JSON.stringify(policy.formConfiguration ?? '')
		: policy.codeConfiguration ?? '';

	const fileNameExtension = getFileNameExtension(policy.isFormConfiguration, policy.codeType);
	const libraryName = policy.library.toLowerCase();
	const configurationFileName = `.${libraryName}rc.${fileNameExtension}`;
	const ignoreFileName = `.${libraryName}ignore`;
	const configFilePath = path.join(EXLINT_FOLDER_PATH, groupId, configurationFileName);
	const ignoreFilePath = path.join(EXLINT_FOLDER_PATH, groupId, ignoreFileName);
	const writePromises = [fs.outputFile(configFilePath, configurationData)];

	if (libraryName !== 'depcheck') {
		writePromises.push(fs.outputFile(ignoreFilePath, policy.ignoredList.join(os.EOL)));
	}

	if (policy.lintedList.length > 0) {
		const libraryFilesPatternFilePath = path.join(
			EXLINT_FOLDER_PATH,
			groupId,
			`.exlint-${libraryName}-pattern`,
		);

		writePromises.push(fs.outputFile(libraryFilesPatternFilePath, policy.lintedList.join(os.EOL)));
	}

	await Promise.all(writePromises);
};
