import React from 'react';
import { render, Text } from 'ink';
import { Command, CommandRunner, Option } from 'nest-commander';
import type { AxiosError } from 'axios';

import { ApiService } from '@/services/api/api.service';
import NoInternet from '@/ui/NoInternet';
import Error from '@/ui/Error';
import Preparing from '@/ui/Preparing';
import LoggerService from '@/services/logger/logger.service';
import { hasConnection } from '@/helpers/connection';
import { UseService } from '@/modules/use/use.service';

import type { ICommandOptions } from './interfaces/command-options';

@Command({
	name: 'use',
	description: 'Apply a compliance to the project',
	arguments: '<compliance_id>',
	argsDescription: { compliance_id: 'The identifer of the compliance to use' },
})
export class UseCommand extends CommandRunner {
	constructor(
		private readonly loggerService: LoggerService,
		private readonly apiService: ApiService,
		private readonly useService: UseService,
	) {
		super();
	}

	public async run([complianceId]: [string], options?: ICommandOptions) {
		const withDebug = options?.debug ?? false;
		const logger = this.loggerService.getLogger(withDebug);

		logger.info('Start compliance usage process');

		const hasConn = await hasConnection();

		logger.info(`Got connectivity status with value: "${hasConn}"`);

		if (!hasConnection) {
			render(<NoInternet />, { debug: withDebug });

			process.exit(1);
		}

		logger.info(`Connection successful. Start command with compliance ID: "${complianceId}"`);

		render(<Preparing debugMode={withDebug} />, { debug: withDebug });

		try {
			/**
			 * First, try to fetch the compliance data.
			 * If it failed, probably user's token is invalid
			 */
			const complianceData = await this.apiService
				.getComplianceData(complianceId)
				.catch((e: AxiosError) => {
					if (e.code === '401') {
						render(<Error message="Please authenticate" />, { debug: withDebug });

						process.exit(1);
					}

					throw e;
				});

			if (complianceData.length === 0) {
				render(
					<Text bold color="magenta">
						No policies were configured in this compliance.
					</Text>,
					{ debug: withDebug },
				);

				process.exit(0);
			}

			await this.useService.use(withDebug, complianceId, complianceData);

			process.exit(0);
		} catch (e) {
			logger.error(
				`Failed to complete authentication process with an error: ${JSON.stringify(e, null, 2)}`,
			);

			render(<Error message="Failed to run Exlint, please try again." />, { debug: withDebug });

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
