import chalk from 'chalk';

import { AbstractLogger } from './logger.abstract';

export class Logger extends AbstractLogger {
	public info(input: string) {
		const currentDate = new Date().toISOString();

		console.log(`[${currentDate}] ${input}`);
	}

	public success(input: string) {
		const currentDate = new Date().toISOString();

		console.log(chalk.greenBright(`[${currentDate}] ${input}`));
	}

	public warn(input: string) {
		const currentDate = new Date().toISOString();

		console.log(chalk.yellowBright(`[${currentDate}] ${input}`));
	}

	public error(input: string) {
		const currentDate = new Date().toISOString();

		console.log(chalk.redBright(`[${currentDate}] ${input}`));
	}
}
