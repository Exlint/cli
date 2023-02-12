import React from 'react';
import { Newline, render, Text } from 'ink';
import { Command, CommandRunner, Option } from 'nest-commander';

import Error from '@/ui/Error';
import NoInternet from '@/ui/NoInternet';
import LoggerService from '@/services/logger/logger.service';
import { hasConnection } from '@/helpers/connection';
import { AuthService } from '@/modules/auth/auth.service';

import type { ICommandOptions } from './interfaces/command-options';

@Command({ name: 'auth', description: 'Authenticate Exlint CLI with an Exlint account' })
export class AuthCommand extends CommandRunner {
	constructor(private readonly loggerService: LoggerService, private readonly authService: AuthService) {
		super();
	}

	public async run(_: string[], options?: ICommandOptions) {
		const withDebug = options?.debug ?? false;
		const logger = this.loggerService.getLogger(withDebug);

		logger.info('Start authentication process');

		const hasConn = await hasConnection();

		logger.info(`Got connectivity status with value: "${hasConn}"`);

		if (!hasConn) {
			render(<NoInternet />);

			process.exit(1);
		}

		logger.info('Start authentication process');

		try {
			await this.authService.auth(withDebug);

			render(
				<Text>
					<Newline />
					Your account has been authenticated.&nbsp;
					<Text color="magenta">Exlint</Text> is now ready to use. 🚀🚀
					<Newline />
				</Text>,
			);

			process.exit(0);
		} catch (e) {
			logger.error(
				`Failed to complete authentication process with an error: ${JSON.stringify(e, null, 2)}`,
			);

			render(<Error message="Failed to authenticate, please try again." />);

			process.exit(1);
		}
	}

	@Option({
		flags: '--debug',
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
