import path from 'node:path';
import util from 'node:util';
import { execFile } from 'node:child_process';

import fs from 'fs-extra';
import envinfo from 'envinfo';

import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';
import type { IPolicyServer, IRecommendedPolicyServer } from '@/interfaces/policy';
import { findConfigFileName } from '@/utils/config-file-name';
import { vsCodeExtensions } from '@/models/vscode-extensions';

const asyncExecFile = util.promisify(execFile);

export const adjustLocalVsCode = async (
	groupId: string,
	policies: IPolicyServer[] | IRecommendedPolicyServer[],
) => {
	const projectPath = path.join(EXLINT_FOLDER_PATH, groupId);
	const vsCodeSettingsFilePath = path.join(process.cwd(), '.vscode', 'settings.json');

	const currentVsCodeSettingsContent: Record<string, unknown> = await fs
		.readJson(vsCodeSettingsFilePath)
		.catch(() => ({}));

	const projectFiles = await fs.readdir(projectPath);
	const libraries = policies.map((policy) => policy.library.toLowerCase());

	const config = {
		...currentVsCodeSettingsContent,
		...(libraries.includes('eslint') && {
			'eslint.enable': true,
			'eslint.options': {
				overrideConfigFile: path.join(projectPath, findConfigFileName(projectFiles, 'eslint')),
				ignorePath: path.join(projectPath, '.eslintignore'),
			},
			'eslint.nodePath': path.join(EXLINT_FOLDER_PATH, 'node_modules'),
		}),
		...(libraries.includes('prettier') && {
			'prettier.enable': true,
			// TODO: Remove when EditorConfig is public on Exlint
			'prettier.useEditorConfig': false,
			'prettier.configPath': path.join(projectPath, findConfigFileName(projectFiles, 'prettier')),
			'prettier.ignorePath': path.join(projectPath, '.prettierignore'),
			'prettier.prettierPath': path.join(EXLINT_FOLDER_PATH, 'node_modules', 'prettier'),
			'editor.formatOnSave': true,
			'editor.defaultFormatter': 'esbenp.prettier-vscode',
		}),
		...(libraries.includes('stylelint') && {
			'stylelint.enable': true,
			'stylelint.configFile': path.join(projectPath, findConfigFileName(projectFiles, 'stylelint')),
			'stylelint.stylelintPath': path.join(EXLINT_FOLDER_PATH, 'node_modules', 'stylelint'),
			/**
			 * * VSCode Stylelint extension has issues with repsecting ".stylelintignore" file:
			 * * https://stackoverflow.com/questions/42070748/vs-code-style-lint-ignore-directories
			 * * Currently, there is no way to make the Stylelint VSCode extension respect any ignore files,
			 * * unless it is in the root project: https://github.com/stylelint/vscode-stylelint/issues/408
			 */
		}),
	};

	await fs.outputJson(vsCodeSettingsFilePath, config);
};

export const installExtensions = async (libraries: string[]) => {
	const matchingExtensions = libraries
		.map((library) => vsCodeExtensions[library.toLowerCase()])
		.filter(Boolean) as string[];

	const extensionsCmdArgs = matchingExtensions
		.map((extensionName) => ['--install-extension', extensionName])
		.flat();

	let vsCodeCliCommandPath = 'code';

	if (process.platform === 'darwin') {
		const vsCodeFolderOutput = await asyncExecFile('/usr/bin/mdfind', [
			'kMDItemCFBundleIdentifier = "com.microsoft.VSCode"',
		]);

		if (vsCodeFolderOutput.stderr) {
			throw new Error('Failed to get VSCode path');
		}

		vsCodeCliCommandPath = path.join(
			path.resolve(vsCodeFolderOutput.stdout.trim()),
			'Contents',
			'Resources',
			'app',
			'bin',
			'code',
		);
	} else {
		const vsCodeData = await envinfo.helpers.getVSCodeInfo();

		if (vsCodeData[2]) {
			vsCodeCliCommandPath = vsCodeData[2];
		}
	}

	await asyncExecFile(vsCodeCliCommandPath, [...extensionsCmdArgs, '--force'].flat());
};
