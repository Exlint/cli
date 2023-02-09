import os from 'node:os';

import { Command, CommandRunner, Option } from 'nest-commander';
import React from 'react';
import { render, Text, Box } from 'ink';

import { getNodeJsVersion, getNpmVersion } from '@/helpers/required-software';

import type { ICommandOptions } from './interfaces/command-options';

@Command({
	name: '-',
	description: 'Command handler for base CLI',
	options: { isDefault: true },
})
export class BaseCommand extends CommandRunner {
	public async run(_: string[], options?: ICommandOptions) {
		if (options?.version) {
			render(<Text>v{__VERSION__}</Text>);

			process.exit(0);
		}

		if (options?.envInfo) {
			const [nodeJsVersion, npmJsVersion] = await Promise.all([getNodeJsVersion(), getNpmVersion()]);

			render(
				<Box display="flex" flexDirection="column">
					<Text>NodeJS version: v{nodeJsVersion}</Text>
					<Text>NPM version: v{npmJsVersion}</Text>
					<Text>
						Operation System: {os.platform()} {os.release()}
					</Text>
				</Box>,
			);

			process.exit(0);
		}

		await Promise.resolve();

		process.exit(0);
	}

	@Option({
		flags: '-v, --version [version]',
		description: 'Return version of the CLI',
		required: false,
	})
	public version(value: unknown) {
		return value;
	}

	@Option({
		flags: '--env-info [envInfo]',
		description: 'Output execution environment information',
		required: false,
	})
	public environmentInfo(value: unknown) {
		return value;
	}
}
