import { Command, CommandRunner } from 'nest-commander';
import { render, Text } from 'ink';
import React from 'react';

import { ConnectionService } from '@/modules/connection/connection.service';
import { ExlintConfigService } from '@/modules/exlint-config/exlint-config.service';
import NoInternet from '@/ui/NoInternet';
import Error from '@/ui/Error/Error';

import { getEslintOutput, getPrettierOutput, getStylelintOutput } from './utils/libs-output';

@Command({
	name: 'run',
	description: 'Run a group policies over your project',
})
export class RunCommand implements CommandRunner {
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
			await this.exlintConfigService.init();

			const projectId = this.exlintConfigService.getValue('projectId');

			if (!projectId) {
				render(<Error message="Run 'exlint use' first" />);

				process.exit(1);
			}

			const libsRunOutputs = await Promise.all([
				getEslintOutput(projectId),
				getPrettierOutput(projectId),
				getStylelintOutput(projectId),
			]);

			render(<Text>{libsRunOutputs.join('\n\n')}</Text>);
		} catch {
			render(<Error message="Failed to run Exlint, please try again." />);

			process.exit(1);
		}
	}
}
