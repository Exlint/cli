declare global {
	const __API_URL__: string;
	const __DASHBOARD_URL__: string;

	namespace NodeJS {
		interface ProcessEnv {
			readonly NODE_ENV?: 'development';
		}
	}
}

export {};
