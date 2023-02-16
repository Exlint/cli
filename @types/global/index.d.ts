declare global {
	const __CLI_API_URL__: string;
	const __DASHBOARD_URL__: string;
	const __CLI_API_DOMAIN__: string;
	const __VERSION__: string;

	namespace NodeJS {
		interface ProcessEnv {
			readonly NODE_ENV?: 'development';
		}
	}
}

export {};
