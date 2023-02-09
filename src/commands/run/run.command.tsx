import { Command, CommandRunner, Option } from 'nest-commander';
import { Box, Newline, render, Text } from 'ink';
import React from 'react';
import Divider from 'ink-divider';

import { ExlintConfigService } from '@/services/exlint-config/exlint-config.service';
import { ApiService } from '@/services/api/api.service';
import NoInternet from '@/ui/NoInternet';
import Error from '@/ui/Error';
import InvalidToken from '@/ui/InvalidToken';
import Preparing from '@/ui/Preparing';
import LoggerService from '@/services/logger/logger.service';
import { hasConnection } from '@/helpers/connection';

import { getLibsOutput } from './utils/libs-output';
import type { ICommandOptions } from './interfaces/command-options';

@Command({
	name: 'run',
	description: 'Run a group policies over your project',
})
export class RunCommand extends CommandRunner {
	constructor(
		private readonly exlintConfigService: ExlintConfigService,
		private readonly apiService: ApiService,
		private readonly loggerService: LoggerService,
	) {
		super();
	}

	public async run(_: string[], options: ICommandOptions) {
		const logger = this.loggerService.getLogger(options?.debug ?? false);

		logger.info('Start run process');

		const hasConn = await hasConnection();

		logger.info(`Got connectivity status with value: "${hasConn}"`);

		if (!hasConn) {
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

			const groupId = this.exlintConfigService.getValue('groupId');

			if (!groupId) {
				render(<Error message="Run 'exlint use' first" />);

				process.exit(1);
			}

			const libsRunOutputsExecution = await getLibsOutput(groupId, options?.fix ?? false);
			const wasSuccessful = libsRunOutputsExecution.every((item) => item.success);

			render(
				<Box marginTop={1} flexDirection="column">
					{libsRunOutputsExecution.map((outputItem) => (
						<Box key={outputItem.name} flexDirection="column" marginBottom={1}>
							<Divider
								title={outputItem.name}
								titleColor={outputItem.success ? 'greenBright' : 'redBright'}
								width={65}
							/>
							<Box marginTop={1} width={65} paddingX={2}>
								<Text>{outputItem.output}</Text>
							</Box>
						</Box>
					))}
					<Divider width={65} />
					<Newline />
					{wasSuccessful ? (
						<Text bold color="greenBright">
							✔ Exlint completed successfully!
						</Text>
					) : (
						<Text bold color="redBright">
							✖ Exlint completed with failures
						</Text>
					)}
					<Newline />
				</Box>,
			);

			process.exit(wasSuccessful ? 0 : 1);
		} catch {
			render(<Error message="Failed to run Exlint, please try again." />);

			process.exit(1);
		}
	}

	@Option({
		flags: '--fix <fix>',
		name: 'fix',
		description: 'Exlint will try to automatically fix issues if exist',
		defaultValue: false,
	})
	public fix(value: unknown) {
		if (typeof value !== 'boolean') {
			return true;
		}

		return value;
	}

	@Option({
		flags: '--debug [debug]',
		description: 'Extend Exlint output with debug messages',
		required: false,
	})
	public debug(value: unknown) {
		if (typeof value !== 'boolean') {
			return true;
		}

		return value;
	}
}
