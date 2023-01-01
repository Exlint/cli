import dns from 'node:dns/promises';

import { Injectable } from '@nestjs/common';

@Injectable()
export class ConnectionService {
	public async checkConnection() {
		try {
			await dns.lookup('google.com');

			return true;
		} catch {
			return false;
		}
	}
}
