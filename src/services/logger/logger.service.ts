import { Injectable } from '@nestjs/common';

import { Logger } from './logger';
import { NullLogger } from './null-logger';

@Injectable()
export class LoggerService {
	public getLogger(debug: boolean) {
		if (debug) {
			return new Logger();
		}

		return new NullLogger();
	}
}

export default LoggerService;
