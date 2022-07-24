import webpack from 'webpack';
import WebpackShellPluginNext from 'webpack-shell-plugin-next';
import isCI from 'is-ci';

const isDev = process.env.NODE_ENV === 'development' && !isCI;
const cliApiDomain = isDev ? 'localhost' : 'cli-api.exlint.io';
const cliApiUrl = isDev ? 'http://localhost:5000' : 'https://www.cli-api.exlint.io';
const dashboardUrl = isDev ? 'http://localhost:8080' : 'https://www.app.exlint.io';

const configuration = (options: webpack.Configuration): webpack.Configuration => ({
	...options,
	plugins: [
		...options.plugins!,
		new WebpackShellPluginNext({
			onBuildStart: {
				scripts: ['rimraf dist'],
				blocking: true,
			},
			safe: true,
		}),
		new webpack.DefinePlugin({
			__CLI_API_DOMAIN__: `'${cliApiDomain}'`,
			__CLI_API_URL__: `'${cliApiUrl}'`,
			__DASHBOARD_URL__: `'${dashboardUrl}'`,
		}),
	],
});

export default configuration;
