import http from 'node:http';
import type { AddressInfo } from 'node:net';

import React from 'react';
import { Newline, render, Text } from 'ink';
import { Command, CommandRunner, Option } from 'nest-commander';
import open from 'open';
import express from 'express';
import { Netrc } from 'netrc-parser';

import Error from '@/ui/Error';
import NoInternet from '@/ui/NoInternet';
import PendingAuth from '@/containers/Auth/PendingAuth';
import LoggerService from '@/services/logger/logger.service';
import { hasConnection } from '@/helpers/connection';

import type { IRedirectParams } from './interfaces/redirect-token';
import { AUTHENTICATION_TIMEOUT } from './constants/auth-timeout';
import type { ICommandOptions } from './interfaces/command-options';

@Command({ name: 'auth', description: 'Authenticate Exlint CLI with an Exlint account' })
export class AuthCommand extends CommandRunner {
	constructor(private readonly loggerService: LoggerService) {
		super();
	}

	public async run(_: string[], options?: ICommandOptions) {
		const logger = this.loggerService.getLogger(options?.debug ?? false);

		logger.info('Start authentication process');

		const hasConn = await hasConnection();

		logger.info(`Got connectivity status with value: "${hasConn}"`);

		if (!hasConn) {
			render(<NoInternet />);

			process.exit(1);
		}

		logger.info('Setting up Express server to detect authentication completion');

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

			const serverAddress = temporaryServer.address() as AddressInfo;
			const serverPort = serverAddress.port;
			const authUrl = `${__DASHBOARD_URL__}/cli-auth?port=${serverPort}`;

			logger.info(`Server is listening on port: "${serverPort}"`);

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

					logger.info(`Got an authentication with an email: "${email}"`);

					if (!token || !email) {
						logger.error('Invalid authentication');

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

			logger.info('Storing authentication credentials in "netrc" file');

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
		} catch (e) {
			logger.error(
				`Failed to complete authentication process with an error: ${JSON.stringify(e, null, 2)}`,
			);

			render(<Error message="Failed to authenticate, please try again." />);

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
