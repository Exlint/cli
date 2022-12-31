import path from 'path';
import util from 'util';
import { exec, execFile } from 'child_process';

import fs from 'fs-extra';
import { Injectable } from '@nestjs/common';
import envinfo from 'envinfo';

import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';
import type { IPolicyServer } from '@/interfaces/policy';
import { findConfigFileName } from '@/utils/config-file-name';

import { vsCodeExtensions } from '../../models/vscode-extensions';
import IdeLibrares from './ide-libraries';

const asyncExecFile = util.promisify(execFile);
const asyncExec = util.promisify(exec);

@Injectable()
export class VsCodeLibrariesService extends IdeLibrares {
	public async adjustLocal(projectId: string, policies: IPolicyServer[]) {
		const projectPath = path.join(EXLINT_FOLDER_PATH, projectId);
		const vsCodeSettingsFilePath = path.join(process.cwd(), '.vscode', 'settings.json');

		const currentVsCodeSettingsContent: JSON = await fs
			.readJson(vsCodeSettingsFilePath)
			.catch(() => ({}));

		const projectFiles = await fs.readdir(projectPath);
		const libraries = policies.map((policy) => policy.library.toLowerCase());

		const stylelintIgnoreList =
			policies.find((policy) => policy.library === 'Stylelint')?.ignoredList ?? [];

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
				'stylelint.configFile': path.join(projectPath, '.stylelintrc.json'),
				'stylelint.stylelintPath': path.join(EXLINT_FOLDER_PATH, 'node_modules', 'stylelint'),
				'stylelint.configOverrides': { ignoreFiles: stylelintIgnoreList },
			}),
		};

		await fs.outputJson(vsCodeSettingsFilePath, config);
	}

	public async installExtensions(libraries: string[]) {
		const matchingExtensions = libraries
			.map((library) => vsCodeExtensions[library.toLowerCase()])
			.filter(Boolean) as string[];

		const extensionsCmdArgs = matchingExtensions
			.map((extensionName) => ['--install-extension', extensionName])
			.flat();

		let vsCodeCliCommandPath = 'code';

		if (process.platform === 'darwin') {
			const detectVsCodeFolderCommand =
				'/usr/bin/mdfind kMDItemCFBundleIdentifier = "com.microsoft.VSCode"';

			const vsCodeFolderOutput = await asyncExec(detectVsCodeFolderCommand);

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
	}
}
