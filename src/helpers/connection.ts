import dns from 'node:dns/promises';

export const hasConnection = async () => {
	try {
		await dns.lookup('google.com');

		return true;
	} catch {
		return false;
	}
};
