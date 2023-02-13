import crypto from 'node:crypto';
import path from 'node:path';

import React from 'react';
import { Text, render, Box, Newline } from 'ink';
import { Command, CommandRunner, Option } from 'nest-commander';
import fs from 'fs-extra';
import open from 'open';

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
import { ExlintConfigService } from '@/services/exlint-config/exlint-config.service';
import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';
import { AuthService } from '@/modules/auth/auth.service';

import { languagesItems } from './models/languages';
import type { ICommandOptions } from './interfaces/command-options';
import { confirmationItems, userCreationConfirmationItems } from './models/confirmation';

@Command({ name: 'go', description: 'Run our recommended compliance over your project' })
export class GoCommand extends CommandRunner {
	private debugMode = false;
	private isAuthenticatedPromise: Promise<boolean> | null = null;
	private selectedLanguages: string[] | null = null;

	constructor(
		private readonly loggerService: LoggerService,
		private readonly apiService: ApiService,
		private readonly useService: UseService,
		private readonly runService: RunService,
		private readonly authService: AuthService,
		private readonly exlintConfigService: ExlintConfigService,
	) {
		super();
	}

	private async onSubmitApplyingCompliance([confirmation]: string[]) {
		const logger = this.loggerService.getLogger(this.debugMode);

		if (confirmation === 'No') {
			process.exit(0);
		}

		try {
			await this.exlintConfigService.init();
			const temporaryGroupId = this.exlintConfigService.getValue('groupId');

			if (!temporaryGroupId) {
				logger.error(
					'Failed to store recommended group in account because could not get the temporary group ID',
				);

				render(
					<Error message="Failed to store recommended group in your account. Please try again." />,
				);

				process.exit(1);
			}

			const storeResponseData = await this.apiService.storeRecommendedCompliance(
				this.selectedLanguages!,
			);

			const temporaryGroupFolderPath = path.join(EXLINT_FOLDER_PATH, temporaryGroupId);
			const newGroupId = storeResponseData.groupId;
			const newGroupFolderPath = path.join(EXLINT_FOLDER_PATH, newGroupId);

			await Promise.all([
				this.exlintConfigService.setValues({ groupId: newGroupId }),
				fs.move(temporaryGroupFolderPath, newGroupFolderPath, { overwrite: true }),
			]);

			const vsCodeSettingsFilePath = path.join(process.cwd(), '.vscode', 'settings.json');
			const settingsData = await fs.readFile(vsCodeSettingsFilePath, 'utf-8');
			const newSettingsData = settingsData.replaceAll(temporaryGroupId, newGroupId);

			await fs.writeFile(vsCodeSettingsFilePath, newSettingsData);

			render(
				<Text color="green" bold>
					🚀 Group successfully added to your account!
				</Text>,
			);

			process.exit(0);
		} catch (e) {
			logger.error(
				`Failed to store recommended group in the account with an error: ${JSON.stringify(
					e,
					null,
					2,
				)}`,
			);

			render(<Error message="Failed to store recommended group in your account. Please try again." />);

			process.exit(1);
		}
	}

	private async onSubmitUserCreation([confirmation]: string[]) {
		const logger = this.loggerService.getLogger(this.debugMode);

		if (confirmation === 'No') {
			process.exit(0);
		}

		try {
			await this.authService.auth(this.debugMode);

			await this.exlintConfigService.init();
			const temporaryGroupId = this.exlintConfigService.getValue('groupId');

			if (!temporaryGroupId) {
				logger.error(
					'Failed to store recommended group in account because could not get the temporary group ID',
				);

				render(
					<Error message="Failed to store recommended group in your account. Please try again." />,
				);

				process.exit(1);
			}

			const storeResponseData = await this.apiService.storeRecommendedCompliance(
				this.selectedLanguages!,
			);

			const temporaryGroupFolderPath = path.join(EXLINT_FOLDER_PATH, temporaryGroupId);
			const newGroupFolderPath = path.join(EXLINT_FOLDER_PATH, storeResponseData.groupId);

			await Promise.all([
				this.exlintConfigService.setValues({ groupId: storeResponseData.groupId }),
				fs.move(temporaryGroupFolderPath, newGroupFolderPath, { overwrite: true }),
			]);

			render(
				<Text>
					<Newline />
					Your account has been authenticated.&nbsp;
					<Text color="magenta">Exlint</Text> is now ready to use with your new group. 🚀🚀
					<Newline />
				</Text>,
			);

			await open(`${__DASHBOARD_URL__}/group-center/${storeResponseData.groupId}`);

			process.exit(0);
		} catch (e) {
			logger.error(
				`Failed to complete authentication process with an error: ${JSON.stringify(e, null, 2)}`,
			);

			render(<Error message="Failed to authenticate, please try again." />);

			process.exit(1);
		}
	}

	private async applyCompliance(complianceData: IRecommendedPolicyServer[]) {
		const temporaryComplianceId = `tmp-${crypto.randomUUID()}`;

		try {
			await this.useService.use(this.debugMode, temporaryComplianceId, complianceData);

			const [runResult, isAuthenticated] = await Promise.all([
				this.runService.run(false),
				this.isAuthenticatedPromise ?? false,
			]);

			render(
				<Box display="flex" flexDirection="column" marginY={1}>
					{runResult.jsxOutput}

					{!isAuthenticated && (
						<Box
							display="flex"
							flexDirection="column"
							borderStyle="round"
							borderColor="magenta"
							padding={1}
							width={80}
							alignItems="center"
						>
							<Text>
								🚀 Customize & share this <Text color="magenta">compliance</Text> by creating
								a user on our App!
							</Text>

							<MultiSelect
								single
								label={<Text color="greenBright">User Creation:</Text>}
								items={userCreationConfirmationItems}
								onSubmit={(items) => this.onSubmitUserCreation(items)}
							/>
						</Box>
					)}

					{isAuthenticated && (
						<MultiSelect
							single
							label={<Text>Do you want to add this compliance to your account?</Text>}
							items={confirmationItems}
							onSubmit={(items) => this.onSubmitApplyingCompliance(items)}
						/>
					)}
				</Box>,
			);
		} catch (e) {
			render(<Error message="Failed to run Exlint, please try again." />);

			process.exit(1);
		}
	}

	private async onSubmitLanguages(languages: string[]) {
		if (languages.length === 0) {
			render(<Text color="magenta">No languages were chosen</Text>);

			process.exit(0);
		}

		this.selectedLanguages = languages;

		const logger = this.loggerService.getLogger(this.debugMode);

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

		logger.info('Connection was successful');

		this.isAuthenticatedPromise = this.apiService.hasValidToken();

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
				single={false}
				label={labelElement}
				items={languagesItems}
				onSubmit={(items) => this.onSubmitLanguages(items)}
			/>,
		);
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
