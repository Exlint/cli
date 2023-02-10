import crypto from 'node:crypto';

import React from 'react';
import { Text, render } from 'ink';
import { Command, CommandRunner, Option } from 'nest-commander';

import { RunService } from '@/modules/run/run.service';
import { UseService } from '@/modules/use/use.service';
import NoInternet from '@/ui/NoInternet';
import MultiSelect from '@/ui/MultiSelect';
import { ApiService } from '@/services/api/api.service';
import LoggerService from '@/services/logger/logger.service';
import Preparing from '@/ui/Preparing';
import Error from '@/ui/Error';
import { hasConnection } from '@/helpers/connection';
import type { IRecommendedPolicyServer } from '@/interfaces/policy';

import { languagesItems } from './models/languages';
import type { ICommandOptions } from './interfaces/command-options';

@Command({ name: 'go', description: 'Run our recommended compliance over your project' })
export class GoCommand extends CommandRunner {
	private debugMode = false;

	constructor(
		private readonly loggerService: LoggerService,
		private readonly apiService: ApiService,
		private readonly useService: UseService,
		private readonly runService: RunService,
	) {
		super();
	}

	private async applyCompliance(complianceData: IRecommendedPolicyServer[]) {
		const temporaryComplianceId = `tmp-${crypto.randomUUID()}`;

		try {
			await this.useService.use(temporaryComplianceId, complianceData);

			const wasSuccessful = await this.runService.run(false);

			process.exit(wasSuccessful ? 0 : 1);
		} catch (e) {
			render(<Error message="Failed to run Exlint, please try again." />);

			process.exit(1);
		}
	}

	private async onSubmitLanguages(languages: string[]) {
		const logger = this.loggerService.getLogger(this.debugMode);

		if (languages.length === 0) {
			render(<Text color="magenta">No languages were chosen</Text>);

			process.exit(0);
		}

		logger.info(`Start Go command process with selected languages: "${languages}"`);

		render(<Preparing />);

		try {
			const complianceData = await this.apiService.getComplianceData(languages);

			await this.applyCompliance(complianceData);
		} catch (e) {
			logger.error(`Failed to reach Exlint API with an error: ${JSON.stringify(e, null, 2)}`);

			render(<Error message="Failed to reach Exlint API, please try again." />);

			process.exit(1);
		}
	}

	public async run(_: string[], options?: ICommandOptions) {
		this.debugMode = options?.debug ?? false;

		const logger = this.loggerService.getLogger(this.debugMode);

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
				What
				<Text color="magenta">&nbsp;languages & libraries&nbsp;</Text>
				are you using on
				<Text color="magenta">&nbsp;this&nbsp;</Text>
				project?
			</Text>
		);

		render(
			<MultiSelect
				label={labelElement}
				items={languagesItems}
				onSubmit={(items) => this.onSubmitLanguages(items)}
			/>,
		);
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
