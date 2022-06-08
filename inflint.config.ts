import { Config } from 'inflint';

const inflintConfig: Config = {
	rules: {
		'scripts/**/*': [2, 'kebab-case'],
		'**/*.yml': 2,
	},
};

export default inflintConfig;
