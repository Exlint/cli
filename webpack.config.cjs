const webpack = require('webpack');
const isCI = require('is-ci');
const { merge } = require('webpack-merge');

const isDev = process.env.NODE_ENV === 'development' && !isCI;
const cliApiDomain = isDev ? 'localhost' : 'cli-api.exlint.io';
const cliApiUrl = isDev ? `http://${cliApiDomain}:4000` : `https://www.${cliApiDomain}`;
const dashboardUrl = isDev ? 'http://localhost:8080' : 'https://www.app.exlint.io';

const configuration = (options) =>
	merge(options, {
		plugins: [
			new webpack.DefinePlugin({
				__CLI_API_DOMAIN__: JSON.stringify(cliApiDomain),
				__CLI_API_URL__: JSON.stringify(cliApiUrl),
				__DASHBOARD_URL__: JSON.stringify(dashboardUrl),
			}),
		],
		experiments: {
			topLevelAwait: true,
		},
	});

module.exports = configuration;
