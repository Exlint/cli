import crypto from 'crypto';
import path from 'path';

import React from 'react';
import { render } from 'ink';
import { Command, CommandRunner } from 'nest-commander';
import fs from 'fs-extra';
import isCI from 'is-ci';

import { ConnectionService } from '@/modules/connection/connection.service';
import type { IUseTasks } from '@/interfaces/use-tasks';
import { ExlintConfigService } from '@/modules/exlint-config/exlint-config.service';
import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';
import { ApiService } from '@/modules/api/api.service';
import NoInternet from '@/ui/NoInternet';
import Error from '@/ui/Error/Error';
import Preparing from '@/ui/Preparing';
import UseTasks from '@/containers/Use/UseTasks';

import {
	ADJUST_VSCODE_EXTENSIONS,
	ADJUST_WEBSTORM_PLUGINS,
	CREATE_CONFIGS_FILES,
	INSTALLING_REQUIRED_PACKAGES,
	DOWNLOADING_VSCODE_EXTENSIONS,
} from './models/task';
import { installLibraries } from './utils/install-library';
import { isVsCodeInstalled, ensureRequiredSoftware, isWebstormInstalled } from './utils/required-software';
import { resetConfigLibraries, setConfigLibrary } from './utils/configure-library';
import { VsCodeLibrariesService } from './services/ide-libraries/vscode-libraries.service';
import { WebstormLibrariesService } from './services/ide-libraries/webstorm-libraries.service';

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
		private readonly vsCodeLibrariesService: VsCodeLibrariesService,
		private readonly webstormLibrariesService: WebstormLibrariesService,
	) {}

	public async run([groupId]: [string]) {
		const hasConnection = await this.connectionService.checkConnection();

		if (!hasConnection) {
			render(<NoInternet />);

			process.exit(1);
		}

		render(<Preparing />);

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
				render(<Error message="Node.js and NPM must be installed" />);

				process.exit(1);
			}

			await this.exlintConfigService.init();

			let projectId = this.exlintConfigService.getValue('projectId');

			if (!projectId) {
				projectId = crypto.randomUUID();
			}

			const projectFolderPath = path.join(EXLINT_FOLDER_PATH, projectId);

			const [vsCodeInstalled, webstormInstalled] = await Promise.all([
				isCI ? Promise.resolve(false) : isVsCodeInstalled(),
				isCI ? Promise.resolve(false) : isWebstormInstalled(),
				this.exlintConfigService.setValues({ projectId }),
				fs.ensureDir(projectFolderPath),
				resetConfigLibraries(projectId),
			]);

			const requiredLibraries = groupData.policies.map((policy) => policy.library);

			const tasks: IUseTasks = {
				[INSTALLING_REQUIRED_PACKAGES]: 'loading',
				[CREATE_CONFIGS_FILES]: 'loading',
				...(vsCodeInstalled && {
					[DOWNLOADING_VSCODE_EXTENSIONS]: 'loading',
					[ADJUST_VSCODE_EXTENSIONS]: 'loading',
				}),
				...(webstormInstalled && {
					[ADJUST_WEBSTORM_PLUGINS]: 'loading',
				}),
			};

			render(<UseTasks tasks={tasks} />);

			const downloadLibrariesPromise = installLibraries(projectFolderPath, requiredLibraries)
				.then(() => {
					tasks[INSTALLING_REQUIRED_PACKAGES] = 'success';
				})
				.catch(() => {
					tasks[INSTALLING_REQUIRED_PACKAGES] = 'error';
				})
				.finally(() => {
					render(<UseTasks tasks={tasks} />);
				});

			const setConfigLibrariesPromises = groupData.policies
				.filter(
					(policy) =>
						policy.configuration !== null && Object.keys(policy.configuration).length !== 0,
				)
				.map((policy) => setConfigLibrary(projectId!, policy.library, policy.configuration!));

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
					this.vsCodeLibrariesService
						.installExtensions(requiredLibraries)
						.then(() => {
							tasks[DOWNLOADING_VSCODE_EXTENSIONS] = 'success';
						})
						.catch(() => {
							tasks[DOWNLOADING_VSCODE_EXTENSIONS] = 'error';
						})
						.finally(() => {
							render(<UseTasks tasks={tasks} />);
						}),
					this.vsCodeLibrariesService
						.adjustLocal(projectId, requiredLibraries)
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

			if (webstormInstalled) {
				tasksPromises.push(
					this.webstormLibrariesService
						.adjustLocal(projectId, requiredLibraries)
						.then(() => {
							tasks[ADJUST_WEBSTORM_PLUGINS] = 'success';
						})
						.catch(() => {
							tasks[ADJUST_WEBSTORM_PLUGINS] = 'error';
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
