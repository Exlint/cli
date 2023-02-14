import http from 'node:http';
import type { AddressInfo } from 'node:net';

import { Injectable } from '@nestjs/common';
import { render } from 'ink';
import React from 'react';
import express from 'express';
import open from 'open';
import { Netrc } from 'netrc-parser';

import Error from '@/ui/Error';
import LoggerService from '@/services/logger/logger.service';
import PendingAuth from '@/containers/Auth/PendingAuth';

import type { IRedirectParams } from './interfaces/redirect-token';
import { AUTHENTICATION_TIMEOUT } from './constants/auth-timeout';

@Injectable()
export class AuthService {
	constructor(private readonly loggerService: LoggerService) {}

	public async auth(withDebug: boolean) {
		const logger = this.loggerService.getLogger(withDebug);

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

		console.clear();

		render(<PendingAuth debugMode={withDebug} link={authUrl} />, { debug: withDebug });

		await open(authUrl);

		const { token, email } = await new Promise<IRedirectParams>((resolve) => {
			const authenticationTimeout = setTimeout(() => {
				temporaryServer.close();

				render(<Error message="Authentication expired, please try again" />, { debug: withDebug });

				process.exit(1);
			}, AUTHENTICATION_TIMEOUT);

			app.get('/:token/:email', (req: express.Request<IRedirectParams>, res: express.Response) => {
				const { token, email } = req.params;

				logger.info(`Got an authentication with an email: "${email}"`);

				if (!token || !email) {
					logger.error('Invalid authentication');

					render(<Error />, { debug: withDebug });

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
	}
}
