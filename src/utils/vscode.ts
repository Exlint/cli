import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import fs from 'fs-extra';

import { ILibrary } from '@/interfaces/library';
import { vsCodeExtensions } from '@/models/vscode-extensions';
import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';

const asyncExec = util.promisify(exec);

export const installVsCodeExtensions = async (...libs: ILibrary[]) => {
	if (libs.length === 0) {
		return;
	}

	const matchingExtensions = libs.map((lib) => vsCodeExtensions[lib]).filter(Boolean);

	const cmdArgs = matchingExtensions
		.map((extensionName) => `--install-extension ${extensionName}`)
		.join(' ');

	const cmd = `code ${cmdArgs} --force`;

	await asyncExec(cmd);
};

export const adjustLocalToExtensions = async (projectId: string, ...libs: ILibrary[]) => {
	if (libs.length === 0) {
		return;
	}

	const vsCodeSettingsFilePath = path.join(process.cwd(), '.vscode', 'settings.json');

	const currentVsCodeSettingsContent: Record<string, unknown> = await fs
		.readJson(vsCodeSettingsFilePath)
		.catch(() => ({}));

	const projectPath = path.join(EXLINT_FOLDER_PATH, projectId);

	const config: Record<string, unknown> = {};

	if (libs.includes('eslint')) {
		config['eslint.workingDirectories'] = [projectPath];
	}

	if (libs.includes('prettier')) {
		const prettierConfigFilePath = path.join(EXLINT_FOLDER_PATH, projectId, '.prettierrc.json');

		config['prettier.configPath'] = prettierConfigFilePath;
	}

	if (libs.includes('stylelint')) {
		const stylelintConfigFilePath = path.join(EXLINT_FOLDER_PATH, projectId, '.stylelintrc.json');

		config['stylelint.configFile'] = stylelintConfigFilePath;
	}

	const mergedSettings = {
		...currentVsCodeSettingsContent,
		...config,
	};

	await fs.outputJson(vsCodeSettingsFilePath, mergedSettings);
};
