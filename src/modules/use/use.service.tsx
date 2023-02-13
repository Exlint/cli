import path from 'node:path';

import { Injectable } from '@nestjs/common';
import { render } from 'ink';
import React from 'react';
import isCI from 'is-ci';
import fs from 'fs-extra';

import Error from '@/ui/Error';

import { ExlintConfigService } from '@/services/exlint-config/exlint-config.service';
import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';
import UseTasks from '@/containers/Use/UseTasks';
import { intersection } from '@/utils/intersection';
import { ensureRequiredSoftware, isVsCodeInstalled } from '@/helpers/required-software';
import type { IUseTasks } from '@/interfaces/use-tasks';
import type { IPolicyServer, IRecommendedPolicyServer } from '@/interfaces/policy';
import LoggerService from '@/services/logger/logger.service';

import {
	ADJUST_VSCODE_EXTENSIONS,
	CREATE_CONFIGS_FILES,
	DOWNLOADING_VSCODE_EXTENSIONS,
	INSTALLING_REQUIRED_PACKAGES,
} from './models/use-tasks';
import { installLibraries } from './utils/install-library';
import { setConfigLibrary } from './utils/configure-library';
import { adjustLocalVsCode, installExtensions } from './helpers/vscode';

@Injectable()
export class UseService {
	constructor(
		private readonly exlintConfigService: ExlintConfigService,
		private readonly loggerService: LoggerService,
	) {}

	public async use(
		withDebug: boolean,
		groupId: string,
		groupData: IPolicyServer[] | IRecommendedPolicyServer[],
	) {
		const logger = this.loggerService.getLogger(withDebug);

		const requiredLibraries = groupData.map((policy) => policy.library);

		logger.info(`Exlint is going to install libraries for: "${requiredLibraries.toString()}"`);

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

		const projectFolderPath = path.join(EXLINT_FOLDER_PATH, groupId);

		logger.info(`Exlint projecrt folder path for this repository is: "${projectFolderPath}"`);

		const shouldAdjustToIde =
			!isCI && intersection(requiredLibraries, ['eslint', 'prettier', 'stylelint'], false).length > 0;

		const [shouldAdjustToVsCode] = await Promise.all([
			shouldAdjustToIde && isVsCodeInstalled(),
			this.exlintConfigService.setValues({ groupId }),
			// Note that "emptyDir" - "If the directory does not exist, it is created."
			fs.emptyDir(projectFolderPath),
		]);

		const tasks: IUseTasks = {
			[INSTALLING_REQUIRED_PACKAGES]: 'loading',
			[CREATE_CONFIGS_FILES]: 'loading',
			...(shouldAdjustToVsCode && {
				[DOWNLOADING_VSCODE_EXTENSIONS]: 'pending',
				[ADJUST_VSCODE_EXTENSIONS]: 'pending',
			}),
		};

		render(<UseTasks tasks={tasks} />);

		const downloadLibrariesPromise = installLibraries(requiredLibraries)
			.then(() => {
				tasks[INSTALLING_REQUIRED_PACKAGES] = 'success';
			})
			.catch((e) => {
				logger.error(`Failed to install libraries with an error: ${JSON.stringify(e, null, 2)}`);

				tasks[INSTALLING_REQUIRED_PACKAGES] = 'error';
			})
			.finally(() => {
				render(<UseTasks tasks={tasks} />);
			});

		const setConfigLibrariesPromises = groupData.map((policy) => setConfigLibrary(groupId, policy));

		const setConfigLibrariesPromise = Promise.all(setConfigLibrariesPromises)
			.then(() => {
				tasks[CREATE_CONFIGS_FILES] = 'success';
			})
			.catch((e) => {
				logger.error(`Failed to configure libraries with an error: ${JSON.stringify(e, null, 2)}`);

				tasks[CREATE_CONFIGS_FILES] = 'error';
			})
			.finally(() => {
				render(<UseTasks tasks={tasks} />);
			});

		await Promise.all([downloadLibrariesPromise, setConfigLibrariesPromise]);

		if (shouldAdjustToVsCode) {
			tasks[DOWNLOADING_VSCODE_EXTENSIONS] = 'loading';
			tasks[ADJUST_VSCODE_EXTENSIONS] = 'loading';

			await Promise.all([
				installExtensions(requiredLibraries)
					.then(() => {
						tasks[DOWNLOADING_VSCODE_EXTENSIONS] = 'success';
					})
					.catch((e) => {
						logger.error(
							`Failed to install VSCode extensions with an error: ${JSON.stringify(
								e,
								null,
								2,
							)}`,
						);

						tasks[DOWNLOADING_VSCODE_EXTENSIONS] = 'error';
					})
					.finally(() => {
						render(<UseTasks tasks={tasks} />);
					}),
				adjustLocalVsCode(groupId, groupData)
					.then(() => {
						tasks[ADJUST_VSCODE_EXTENSIONS] = 'success';
					})
					.catch((e) => {
						logger.error(
							`Failed to adjust VSCode environment with an error: ${JSON.stringify(
								e,
								null,
								2,
							)}`,
						);

						tasks[ADJUST_VSCODE_EXTENSIONS] = 'error';
					})
					.finally(() => {
						render(<UseTasks tasks={tasks} />);
					}),
			]);
		}
	}
}
