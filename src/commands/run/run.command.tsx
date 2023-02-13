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
			const { wasSuccessful, jsxOutput } = await this.runService.run(options?.fix ?? false);

			render(jsxOutput);

			process.exit(wasSuccessful ? 0 : 1);
		} catch {
			render(<Error message="Failed to run Exlint, please try again." />);

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
