import crypto from 'crypto';
import path from 'path';

import React from 'react';
import { render, Text } from 'ink';
import { Command, CommandRunner } from 'nest-commander';
import fs from 'fs-extra';
import isCI from 'is-ci';
import { AxiosError } from 'axios';

import { ConnectionService } from '@/modules/connection/connection.service';
import type { IUseTasks } from '@/interfaces/use-tasks';
import { ExlintConfigService } from '@/modules/exlint-config/exlint-config.service';
import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';
import { ApiService } from '@/modules/api/api.service';
import NoInternet from '@/ui/NoInternet';
import Error from '@/ui/Error/Error';
import Preparing from '@/ui/Preparing';
import UseTasks from '@/containers/Use/UseTasks';
import { intersection } from '@/utils/intersection';

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
import { IPolicyFilesPattern } from './interfaces/file-pattern';

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
			const groupData = await this.apiService.getGroupData(groupId).catch((e: AxiosError) => {
				if (e.code === '401') {
					render(<Error message="Please authenticate" />);

					process.exit(1);
				}

				throw e;
			});

			if (groupData.inlinePolicies.length === 0) {
				render(
					<Text bold color="magenta">
						No policies were configured in this group.
					</Text>,
				);

				process.exit(0);
			}

			const requiredLibraries = groupData.inlinePolicies.map((policy) => policy.library);

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

			const shouldAdjustToIde =
				!isCI && intersection(requiredLibraries, ['eslint', 'prettier', 'stylelint']).length > 0;

			const [shouldAdjustToVsCode, shouldAdjustToWebstorm] = await Promise.all([
				shouldAdjustToIde && isVsCodeInstalled(),
				shouldAdjustToIde && isWebstormInstalled(),
				this.exlintConfigService.setValues({ projectId }),
				fs.ensureDir(projectFolderPath),
				resetConfigLibraries(projectId),
			]);

			const tasks: IUseTasks = {
				[INSTALLING_REQUIRED_PACKAGES]: 'loading',
				[CREATE_CONFIGS_FILES]: 'loading',
				...(shouldAdjustToVsCode && {
					[DOWNLOADING_VSCODE_EXTENSIONS]: 'pending',
					[ADJUST_VSCODE_EXTENSIONS]: 'pending',
				}),
				...(shouldAdjustToWebstorm && {
					[ADJUST_WEBSTORM_PLUGINS]: 'pending',
				}),
			};

			render(<UseTasks tasks={tasks} />);

			const downloadLibrariesPromise = installLibraries(requiredLibraries)
				.then(() => {
					tasks[INSTALLING_REQUIRED_PACKAGES] = 'success';
				})
				.catch(() => {
					tasks[INSTALLING_REQUIRED_PACKAGES] = 'error';
				})
				.finally(() => {
					render(<UseTasks tasks={tasks} />);
				});

			const setConfigLibrariesPromises = groupData.inlinePolicies.map((policy) =>
				setConfigLibrary(projectId!, policy.library, policy.configuration),
			);

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

			await Promise.all([downloadLibrariesPromise, setConfigLibrariesPromise]);

			const editorsPromises: Promise<void>[] = [];

			if (shouldAdjustToVsCode) {
				tasks[DOWNLOADING_VSCODE_EXTENSIONS] = 'loading';
				tasks[ADJUST_VSCODE_EXTENSIONS] = 'loading';

				editorsPromises.push(
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

			if (shouldAdjustToWebstorm) {
				const policiesFilesPattern = groupData.inlinePolicies.reduce<IPolicyFilesPattern>(
					(final, policy) => {
						return {
							...final,
							[policy.library]: policy.configuration?.__EXLINT_FILES_PATTERN__,
						};
					},
					{},
				);

				tasks[ADJUST_WEBSTORM_PLUGINS] = 'loading';

				editorsPromises.push(
					this.webstormLibrariesService
						.adjustLocal(projectId, requiredLibraries, policiesFilesPattern)
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

			await Promise.all(editorsPromises);
		} catch {
			render(<Error message="Failed to run Exlint, please try again." />);

			process.exit(1);
		}
	}
}
