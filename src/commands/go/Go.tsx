import React from 'react';
import { Text, render } from 'ink';
import { Command, CommandRunner } from 'nest-commander';

import { ConnectionService } from '@/modules/connection/connection.service';
import NoInternet from '@/ui/NoInternet';
import MultiSelect from '@/ui/MultiSelect';

import { languagesItems } from './models/languages';

@Command({ name: 'go', description: 'Run our recommended compliance over your project' })
export class GoCommand extends CommandRunner {
	constructor(private readonly connectionService: ConnectionService) {
		super();
	}

	public async run() {
		const hasConnection = await this.connectionService.checkConnection();

		if (!hasConnection) {
			render(<NoInternet />);

			process.exit(1);
		}

		const onSubmitLanguages = (items: string[]) => {
			render(<Text>{items.toString()}</Text>);
		};

		render(<MultiSelect items={languagesItems} onSubmit={onSubmitLanguages} />);
	}
}
