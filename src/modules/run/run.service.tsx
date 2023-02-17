import { Injectable } from '@nestjs/common';
import { Box, Newline, Text, render } from 'ink';
import React from 'react';
import Divider from 'ink-divider';

import { ExlintConfigService } from '@/services/exlint-config/exlint-config.service';
import Error from '@/ui/Error';

import { getLibsOutput } from './utils/libs-output';

@Injectable()
export class RunService {
	constructor(private readonly exlintConfigService: ExlintConfigService) {}

	public async run(withFix: boolean, withDebug: boolean) {
		await this.exlintConfigService.init();

		const complianceId = this.exlintConfigService.getValue('complianceId');

		if (!complianceId) {
			render(<Error message="Missing compliance ID in project" />, { debug: withDebug });

			process.exit(1);
		}

		const libsRunOutputsExecution = await getLibsOutput(complianceId, withFix);
		const wasSuccessful = libsRunOutputsExecution.every((item) => item.success);

		const jsxOutput = (
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
			</Box>
		);

		return { wasSuccessful, jsxOutput };
	}
}
