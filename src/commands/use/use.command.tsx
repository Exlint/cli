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
	description: 'Apply a group to the project',
	arguments: '<group_id>',
	argsDescription: { group_id: 'The identifer of the group to use' },
})
export class UseCommand extends CommandRunner {
	constructor(
		private readonly loggerService: LoggerService,
		private readonly apiService: ApiService,
		private readonly useService: UseService,
	) {
		super();
	}

	public async run([groupId]: [string], options?: ICommandOptions) {
		const logger = this.loggerService.getLogger(options?.debug ?? false);

		logger.info('Start group usage process');

		const hasConn = await hasConnection();

		logger.info(`Got connectivity status with value: "${hasConn}"`);

		if (!hasConnection) {
			render(<NoInternet />);

			process.exit(1);
		}

		logger.info(`Connection successful. Start command with group ID: "${groupId}"`);

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

			if (groupData.length === 0) {
				render(
					<Text bold color="magenta">
						No policies were configured in this group.
					</Text>,
				);

				process.exit(0);
			}

			await this.useService.use(groupId, groupData);

			process.exit(0);
		} catch (e) {
			logger.error(
				`Failed to complete authentication process with an error: ${JSON.stringify(e, null, 2)}`,
			);

			render(<Error message="Failed to run Exlint, please try again." />);

			process.exit(1);
		}
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
