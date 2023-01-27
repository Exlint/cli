const webpack = require('webpack');
const isCI = require('is-ci');
const { merge } = require('webpack-merge');

const isDev = process.env.NODE_ENV === 'development' && !isCI;
const cliApiDomain = isDev ? 'localhost' : 'cli-api.exlint.io';
const cliApiUrl = isDev ? `http://${cliApiDomain}:4000` : `https://${cliApiDomain}`;
const dashboardUrl = isDev ? 'http://localhost:8080' : 'https://app.exlint.io';

/**
 * @type { import('webpack').Configuration }
 */
const configuration = {
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
};

const mergedConfiguration = (options) => merge(options, configuration);

module.exports = mergedConfiguration;
