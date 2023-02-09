import crypto from 'node:crypto';

import React from 'react';
import { Text, render } from 'ink';
import { Command, CommandRunner, Option } from 'nest-commander';

import { UseService } from '@/modules/use/use.service';
import NoInternet from '@/ui/NoInternet';
import MultiSelect from '@/ui/MultiSelect';
import { ApiService } from '@/services/api/api.service';
import LoggerService from '@/services/logger/logger.service';
import Preparing from '@/ui/Preparing';
import Error from '@/ui/Error';
import { hasConnection } from '@/helpers/connection';

import { languagesItems } from './models/languages';
import type { ICommandOptions } from './interfaces/command-options';

@Command({ name: 'go', description: 'Run our recommended compliance over your project' })
export class GoCommand extends CommandRunner {
	constructor(
		private readonly loggerService: LoggerService,
		private readonly apiService: ApiService,
		private readonly useService: UseService,
	) {
		super();
	}

	private async use(languages: string[]) {
		const temporaryComplianceId = `tmp-${crypto.randomUUID()}`;

		try {
			const complianceData = await this.apiService.getComplianceData(languages);

			await this.useService.use(temporaryComplianceId, complianceData);
		} catch {
			render(<Error message="Failed to run Exlint, please try again." />);

			process.exit(1);
		}
	}

	private async onSubmitLanguages(items: string[]) {
		if (items.length === 0) {
			render(<Text color="magenta">No languages were chosen</Text>);

			process.exit(0);
		}

		render(<Preparing />);

		await this.use(items);
	}

	public async run(_: string[], options?: ICommandOptions) {
		const logger = this.loggerService.getLogger(options?.debug ?? false);

		logger.info('Start go process');

		const hasConn = await hasConnection();

		logger.info(`Got connectivity status with value: "${hasConn}"`);

		if (!hasConnection) {
			render(<NoInternet />);

			process.exit(1);
		}

		logger.info('Connection successful');

		const labelElement = (
			<Text>
				What languages are you using on
				<Text color="magenta">&nbsp;this&nbsp;</Text>
				project?
			</Text>
		);

		render(<MultiSelect label={labelElement} items={languagesItems} onSubmit={this.onSubmitLanguages} />);
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
