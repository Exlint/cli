import path from 'node:path';
import os from 'node:os';

import fs from 'fs-extra';

import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';
import type { IPolicyServer, IRecommendedPolicyServer } from '@/interfaces/policy';
import { getFileNameExtension } from '@/utils/file-name-extension';
import type { ICodeType } from '@/interfaces/code-type';

export const setConfigLibrary = async (
	complianceId: string,
	policy: IPolicyServer | IRecommendedPolicyServer,
) => {
	let codeType: ICodeType;
	let isFormConfiguration: boolean;
	let configurationData: string;

	// Either provided from "go" command, or "use" command
	if ('configuration' in policy) {
		codeType = 'JSON';
		isFormConfiguration = false;
		configurationData = JSON.stringify(policy.configuration ?? '');
	} else {
		codeType = policy.codeType;
		isFormConfiguration = policy.isFormConfiguration;
		configurationData = isFormConfiguration
			? JSON.stringify(policy.formConfiguration ?? '')
			: policy.codeConfiguration ?? '';
	}

	const fileNameExtension = getFileNameExtension(isFormConfiguration, codeType);
	const libraryName = policy.library.toLowerCase();
	const configurationFileName = `.${libraryName}rc.${fileNameExtension}`;
	const ignoreFileName = `.${libraryName}ignore`;
	const configFilePath = path.join(EXLINT_FOLDER_PATH, complianceId, configurationFileName);
	const ignoreFilePath = path.join(EXLINT_FOLDER_PATH, complianceId, ignoreFileName);
	const writePromises = [fs.outputFile(configFilePath, configurationData)];

	if (libraryName !== 'depcheck') {
		writePromises.push(fs.outputFile(ignoreFilePath, policy.ignoredList.join(os.EOL)));
	}

	if (policy.lintedList.length > 0) {
		const libraryFilesPatternFilePath = path.join(
			EXLINT_FOLDER_PATH,
			complianceId,
			`.exlint-${libraryName}-pattern`,
		);

		writePromises.push(fs.outputFile(libraryFilesPatternFilePath, policy.lintedList.join(os.EOL)));
	}

	await Promise.all(writePromises);
};
