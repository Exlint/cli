import webpack from 'webpack';
import WebpackShellPluginNext from 'webpack-shell-plugin-next';

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
	],
});

export default configuration;
