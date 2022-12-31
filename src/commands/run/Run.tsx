import { Command, CommandRunner, Option } from 'nest-commander';
import { Newline, render, Text } from 'ink';
import React from 'react';

import { ConnectionService } from '@/modules/connection/connection.service';
import { ExlintConfigService } from '@/modules/exlint-config/exlint-config.service';
import { ApiService } from '@/modules/api/api.service';
import NoInternet from '@/ui/NoInternet';
import Error from '@/ui/Error/Error';
import InvalidToken from '@/ui/InvalidToken';
import Preparing from '@/ui/Preparing';

import { getLibsOutput } from './utils/libs-output';
import { ICommandOptions } from './interfaces/options';

@Command({
	name: 'run',
	description: 'Run a group policies over your project',
})
export class RunCommand extends CommandRunner {
	constructor(
		private readonly connectionService: ConnectionService,
		private readonly exlintConfigService: ExlintConfigService,
		private readonly apiService: ApiService,
	) {
		super();
	}

	public async run(_: string[], options: ICommandOptions) {
		const hasConnection = await this.connectionService.checkConnection();

		if (!hasConnection) {
			render(<NoInternet />);

			process.exit(1);
		}

		render(<Preparing />);

		const hadValidToken = await this.apiService.hasValidToken();

		if (!hadValidToken) {
			render(<InvalidToken />);

			process.exit(1);
		}

		try {
			await this.exlintConfigService.init();

			const projectId = this.exlintConfigService.getValue('projectId');

			if (!projectId) {
				render(<Error message="Run 'exlint use' first" />);

				process.exit(1);
			}

			const libsRunOutputs = await getLibsOutput(projectId, options.fix);

			render(
				<Text>
					<Newline />
					{libsRunOutputs}
					<Newline />
				</Text>,
			);
		} catch {
			render(<Error message="Failed to run Exlint, please try again." />);

			process.exit(1);
		}
	}

	@Option({
		flags: '-f, --fix [runWithFix]',
		name: 'withFix',
		description: 'Exlint will try to automatically fix issues if exist',
		defaultValue: false,
	})
	public runWithFix() {
		return;
	}
}
