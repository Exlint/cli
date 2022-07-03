import path from 'path';
import util from 'util';
import { exec } from 'child_process';

import fs from 'fs-extra';
import { Injectable } from '@nestjs/common';

import { ILibrary } from '@/interfaces/library';
import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';

import { vsCodeExtensions } from '../../models/vscode-extensions';
import IdeLibrares from './ide-libraries';

const asyncExec = util.promisify(exec);

@Injectable()
export class VsCodeLibrariesService extends IdeLibrares {
	public async adjustLocal(projectId: string, libs: ILibrary[]) {
		const projectPath = path.join(EXLINT_FOLDER_PATH, projectId);
		const vsCodeSettingsFilePath = path.join(process.cwd(), '.vscode', 'settings.json');

		const currentVsCodeSettingsContent: Record<string, unknown> = await fs
			.readJson(vsCodeSettingsFilePath)
			.catch(() => ({}));

		const config = {
			...currentVsCodeSettingsContent,
			...(libs.includes('eslint') && {
				'eslint.options': {
					overrideConfigFile: path.join(projectPath, '.eslintrc.json'),
				},
				'eslint.nodePath': path.join(projectPath, 'node_modules'),
			}),
			...(libs.includes('prettier') && {
				'prettier.configPath': path.join(projectPath, '.prettierrc.json'),
				'prettier.prettierPath': path.join(projectPath, 'node_modules', 'prettier'),
				'editor.formatOnSave': true,
				'editor.defaultFormatter': 'esbenp.prettier-vscode',
			}),
			...(libs.includes('stylelint') && {
				'stylelint.configFile': path.join(projectPath, '.stylelintrc.json'),
				'stylelint.stylelintPath': path.join(projectPath, 'node_modules', 'stylelint'),
			}),
		};

		await fs.outputJson(vsCodeSettingsFilePath, config);
	}

	public async installExtensions(libs: ILibrary[]) {
		const matchingExtensions = libs.map((lib) => vsCodeExtensions[lib]).filter(Boolean);

		const cmdArgs = matchingExtensions
			.map((extensionName) => `--install-extension ${extensionName}`)
			.join(' ');

		const cmd = `code ${cmdArgs} --force`;

		await asyncExec(cmd);
	}
}
