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
import { ensureRequiredSoftware } from '@/utils/required-software';
import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';

@Command({
	name: 'use',
	description: 'Apply a group to the project',
	arguments: '<group_id>',
	argsDescription: { group_id: 'The identifer of the group to use' },
})
export class UseCommand implements CommandRunner {
	constructor(
		private readonly connectionService: ConnectionService,
		private readonly exlintConfigService: ExlintConfigService,
	) {}

	public async run() {
		const hasConnection = await this.connectionService.checkConnection();

		if (!hasConnection) {
			render(<NoInternet />);

			process.exit(1);
		}

		try {
			/**
			 * Ensure required software is installed.
			 * Currently, only NPM packages are supported, so only Node.js and NPM are required
			 */
			const isSoftwareInstalled = await ensureRequiredSoftware();

			if (!isSoftwareInstalled) {
				render(<Error message="Node and NPM must be installed" />);

				process.exit(1);
			}

			let projectId = this.exlintConfigService.getValue('projectId');

			if (!projectId) {
				projectId = crypto.randomUUID();
			}

			const projectFolderPath = path.join(EXLINT_FOLDER_PATH, projectId);

			await Promise.all([
				this.exlintConfigService.setValues({ projectId }),
				fs.ensureDir(projectFolderPath),
			]);

			//const groupData = await this.apiService.getGroupData(groupId);
			const groupData = await Promise.resolve({
				policies: [
					{ libraryName: 'eslint', configuration: { yazif: 'x' } },
					{ libraryName: 'prettier', configuration: { yazif: 'x' } },
					{ libraryName: 'stylelint', configuration: { yazif: 'x' } },
				],
			});

			const requiredLibraries = groupData.policies.map((policy) => policy.libraryName.toLowerCase());

			const tasks: IUseTasks = {
				'Downloading required packages': 'loading',
				'Creating your linters configurations file': 'loading',
			};

			render(<UseTasks tasks={tasks} />);

			await downloadLibraries(projectFolderPath, ...requiredLibraries);

			tasks['Downloading required packages'] = 'success';

			render(<UseTasks tasks={tasks} />);
		} catch {
			render(<Error message="Failed to run Exlint, please try again." />);

			process.exit(1);
		}
	}
}
