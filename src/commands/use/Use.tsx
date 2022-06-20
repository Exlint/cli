import crypto from 'crypto';
import path from 'path';

import React from 'react';
import { render } from 'ink';
import { Command, CommandRunner } from 'nest-commander';
import fs from 'fs-extra';

import { ConnectionService } from '@/modules/connection/connection.service';
import NoInternet from '@/ui/NoInternet';
import Error from '@/ui/Error/Error';
import { IUseTasks } from '@/interfaces/use-tasks';
import UseTasks from '@/containers/Use/UseTasks';
import { downloadLibraries } from '@/utils/download-library';
import { ExlintConfigService } from '@/modules/exlint-config/exlint-config.service';
import { isVsCodeInstalled, ensureRequiredSoftware } from '@/utils/required-software';
import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';
import { setConfigLibrary } from '@/utils/config-library';
import { ApiService } from '@/modules/api/api.service';
import { adjustLocalToExtensions, installVsCodeExtensions } from '@/utils/vscode';

import {
	ADJUST_VSCODE_EXTENSIONS,
	CREATE_CONFIGS_FILES,
	DOWNLOADING_REQUIRED_PACKAGES,
	DOWNLOADING_VSCODE_EXTENSIONS,
} from './models/task';

@Command({
	name: 'use',
	description: 'Apply a group to the project',
	arguments: '<group_id>',
	argsDescription: { group_id: 'The identifer of the group to use' },
})
export class UseCommand implements CommandRunner {
	constructor(
		private readonly connectionService: ConnectionService,
		private readonly apiService: ApiService,
		private readonly exlintConfigService: ExlintConfigService,
	) {}

	public async run([groupId]: [string]) {
		const hasConnection = await this.connectionService.checkConnection();

		if (!hasConnection) {
			render(<NoInternet />);

			process.exit(1);
		}

		try {
			/**
			 * First, try to fetch the group data.
			 * If it failed, probably user's token is invalid
			 */
			const groupData = await this.apiService.getGroupData(groupId);

			/**
			 * Ensure required software is installed.
			 * Currently, only NPM packages are supported, so only Node.js and NPM are required
			 */
			const isSoftwareInstalled = await ensureRequiredSoftware();

			if (!isSoftwareInstalled) {
				render(<Error message="Node and NPM must be installed" />);

				process.exit(1);
			}

			await this.exlintConfigService.init();

			let projectId = this.exlintConfigService.getValue('projectId');

			if (!projectId) {
				projectId = crypto.randomUUID();
			}

			const projectFolderPath = path.join(EXLINT_FOLDER_PATH, projectId);

			const [vsCodeInstalled] = await Promise.all([
				isVsCodeInstalled(),
				this.exlintConfigService.setValues({ projectId }),
				fs.ensureDir(projectFolderPath),
			]);

			const requiredLibraries = groupData.policies
				.filter((policy) => policy.configuration !== null)
				.map((policy) => policy.library);

			const tasks: IUseTasks = {
				[DOWNLOADING_REQUIRED_PACKAGES]: 'loading',
				[CREATE_CONFIGS_FILES]: 'loading',
			};

			if (vsCodeInstalled) {
				tasks[DOWNLOADING_VSCODE_EXTENSIONS] = 'loading';
				tasks[ADJUST_VSCODE_EXTENSIONS] = 'loading';
			}

			render(<UseTasks tasks={tasks} />);

			const downloadLibrariesPromise = downloadLibraries(projectFolderPath, ...requiredLibraries)
				.then(() => {
					tasks[DOWNLOADING_REQUIRED_PACKAGES] = 'success';
				})
				.catch(() => {
					tasks[DOWNLOADING_REQUIRED_PACKAGES] = 'error';
				})
				.finally(() => {
					render(<UseTasks tasks={tasks} />);
				});

			const setConfigLibrariesPromises = groupData.policies
				.filter((policy) => policy.configuration !== null)
				.map((policy) => setConfigLibrary(policy.library, policy.configuration!));

			const setConfigLibrariesPromise = Promise.all(setConfigLibrariesPromises)
				.then(() => {
					tasks[CREATE_CONFIGS_FILES] = 'success';
				})
				.catch(() => {
					tasks[CREATE_CONFIGS_FILES] = 'error';
				})
				.finally(() => {
					render(<UseTasks tasks={tasks} />);
				});

			const tasksPromises = [downloadLibrariesPromise, setConfigLibrariesPromise];

			if (vsCodeInstalled) {
				tasksPromises.push(
					installVsCodeExtensions(...requiredLibraries)
						.then(() => {
							tasks[DOWNLOADING_VSCODE_EXTENSIONS] = 'success';
						})
						.catch(() => {
							tasks[DOWNLOADING_VSCODE_EXTENSIONS] = 'error';
						})
						.finally(() => {
							render(<UseTasks tasks={tasks} />);
						}),
					adjustLocalToExtensions(projectId, ...requiredLibraries)
						.then(() => {
							tasks[ADJUST_VSCODE_EXTENSIONS] = 'success';
						})
						.catch(() => {
							tasks[ADJUST_VSCODE_EXTENSIONS] = 'error';
						})
						.finally(() => {
							render(<UseTasks tasks={tasks} />);
						}),
				);
			}

			await Promise.all(tasksPromises);
		} catch {
			render(<Error message="Failed to run Exlint, please try again." />);

			process.exit(1);
		}
	}
}
