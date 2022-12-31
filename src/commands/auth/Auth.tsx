import http from 'http';
import type { AddressInfo } from 'net';

import React from 'react';
import { Newline, render, Text } from 'ink';
import { Command, CommandRunner } from 'nest-commander';
import open from 'open';
import express from 'express';
import { Netrc } from 'netrc-parser';

import { ConfigService } from '@/modules/config/config.service';
import { ConnectionService } from '@/modules/connection/connection.service';
import Error from '@/ui/Error/Error';
import NoInternet from '@/ui/NoInternet';
import PendingAuth from '@/containers/Auth/PendingAuth';

import type { IRedirectParams } from './interfaces/redirect-token';
import { AUTHENTICATION_TIMEOUT } from './models/auth-timeout';

@Command({ name: 'auth', description: 'Authenticate Exlint CLI with an Exlint account' })
export class AuthCommand extends CommandRunner {
	constructor(
		private readonly configService: ConfigService,
		private readonly connectionService: ConnectionService,
	) {
		super();
	}

	public async run() {
		const hasConnection = await this.connectionService.checkConnection();

		if (!hasConnection) {
			render(<NoInternet />);

			process.exit(1);
		}

		try {
			// * https://stackoverflow.com/questions/20857865/okay-to-add-a-route-to-node-js-express-while-listening
			const app = express();

			app.use((_: express.Request, res: express.Response, next: express.NextFunction) => {
				res.setHeader('Access-Control-Allow-Origin', '*');
				res.setHeader(
					'Access-Control-Allow-Headers',
					'Origin, X-Requested-With, Content-Type, Accept, Authorization',
				);
				res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');

				next();
			});

			const temporaryServer = http.createServer(app);

			// * https://stackoverflow.com/a/28050404/9105207
			temporaryServer.listen(0);

			const dashboardUrl = this.configService.getValue('DASHBOARD_URL');
			const serverAddress = temporaryServer.address() as AddressInfo;
			const serverPort = serverAddress.port;
			const authUrl = `${dashboardUrl}/cli-auth?port=${serverPort}`;

			render(<PendingAuth link={authUrl} />);

			await open(authUrl);

			const { token, email } = await new Promise<IRedirectParams>((resolve) => {
				const authenticationTimeout = setTimeout(() => {
					temporaryServer.close();

					render(<Error message="Authentication expired, please try again" />);

					process.exit(1);
				}, AUTHENTICATION_TIMEOUT);

				app.get('/:token/:email', (req: express.Request<IRedirectParams>, res: express.Response) => {
					const { token, email } = req.params;

					if (!token || !email) {
						render(<Error />);

						res.status(400).send();

						temporaryServer.close();
						clearTimeout(authenticationTimeout);

						process.exit(1);
					} else {
						resolve({ token, email });

						res.status(200).send();

						temporaryServer.close();
						clearTimeout(authenticationTimeout);

						return;
					}
				});
			});

			const netrc = new Netrc();

			await netrc.load();

			netrc.machines[__CLI_API_DOMAIN__] = {
				login: email,
				password: token,
			};

			await netrc.save();

			render(
				<Text>
					<Newline />
					Your account has been authenticated. Exlint is now ready to use. 🚀🚀
					<Newline />
				</Text>,
			);

			process.exit(0);
		} catch {
			render(<Error message="Failed to authenticate, please try again." />);

			process.exit(1);
		}
	}
}
