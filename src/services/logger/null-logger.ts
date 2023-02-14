import { AbstractLogger } from './logger.abstract';

export class NullLogger extends AbstractLogger {
	public info() {
		return;
	}

	public success() {
		return;
	}

	public warn() {
		return;
	}

	public error() {
		return;
	}
}
