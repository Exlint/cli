import { Command, CommandRunner, Option } from 'nest-commander';
import { render } from 'ink';
import React from 'react';

import { ApiService } from '@/services/api/api.service';
import NoInternet from '@/ui/NoInternet';
import Error from '@/ui/Error';
import InvalidToken from '@/ui/InvalidToken';
import Preparing from '@/ui/Preparing';
import LoggerService from '@/services/logger/logger.service';
import { hasConnection } from '@/helpers/connection';
import { RunService } from '@/modules/run/run.service';

import type { ICommandOptions } from './interfaces/command-options';

@Command({
	name: 'run',
	description: 'Run a group policies over your project',
})
export class RunCommand extends CommandRunner {
	constructor(
		private readonly apiService: ApiService,
		private readonly loggerService: LoggerService,
		private readonly runService: RunService,
	) {
		super();
	}

	public async run(_: string[], options: ICommandOptions) {
		const debugMode = options?.debug ?? false;
		const logger = this.loggerService.getLogger(debugMode);

		logger.info('Start run process');

		const hasConn = await hasConnection();

		logger.info(`Got connectivity status with value: "${hasConn}"`);

		if (!hasConn) {
			render(<NoInternet />, { debug: debugMode });

			process.exit(1);
		}

		render(<Preparing debugMode={debugMode} />, { debug: debugMode });

		const hadValidToken = await this.apiService.hasValidToken();

		if (!hadValidToken) {
			render(<InvalidToken />, { debug: debugMode });

			process.exit(1);
		}

		try {
			const { wasSuccessful, jsxOutput } = await this.runService.run(options?.fix ?? false, debugMode);

			render(jsxOutput, { debug: debugMode });

			process.exit(wasSuccessful ? 0 : 1);
		} catch (e) {
			logger.error(`Failed to run Exlint "run" command with an error: ${JSON.stringify(e, null, 2)}`);

			render(<Error message="Failed to run Exlint, please try again." />, { debug: debugMode });

			process.exit(1);
		}
	}

	@Option({
		flags: '--fix',
		name: 'fix',
		description: 'Exlint will try to automatically fix issues if exist',
		required: false,
	})
	public fix(value: unknown) {
		if (typeof value !== 'boolean') {
			return true;
		}

		return value;
	}

	@Option({
		flags: '--debug',
		name: 'debug',
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
