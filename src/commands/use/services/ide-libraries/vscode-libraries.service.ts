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
	protected async adjustLocalImpl(projectId: string, libs: ILibrary[]) {
		const vsCodeSettingsFilePath = path.join(process.cwd(), '.vscode', 'settings.json');

		const currentVsCodeSettingsContent: Record<string, unknown> = await fs
			.readJson(vsCodeSettingsFilePath)
			.catch(() => ({}));

		const projectPath = path.join(EXLINT_FOLDER_PATH, projectId);

		const config = {
			...currentVsCodeSettingsContent,
			...(libs.includes('eslint') && {
				'eslint.workingDirectories': [projectPath],
			}),
			...(libs.includes('prettier') && {
				'prettier.configPath': path.join(EXLINT_FOLDER_PATH, projectId, '.prettierrc.json'),
			}),
			...(libs.includes('stylelint') && {
				'stylelint.configFile': path.join(EXLINT_FOLDER_PATH, projectId, '.stylelintrc.json'),
			}),
		};

		await fs.outputJson(vsCodeSettingsFilePath, config);
	}

	public async installExtensions(libs: ILibrary[]) {
		if (libs.length === 0) {
			return;
		}

		const matchingExtensions = libs.map((lib) => vsCodeExtensions[lib]).filter(Boolean);

		const cmdArgs = matchingExtensions
			.map((extensionName) => `--install-extension ${extensionName}`)
			.join(' ');

		const cmd = `code ${cmdArgs} --force`;

		await asyncExec(cmd);
	}
}
