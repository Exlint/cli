module.exports = {
	'**/*.{ts,js,cjs}': ['eslint -c ./.eslintrc.cjs --fix', () => 'tsc --noEmit'],
	'**/*.{ts,js,cjs,json,yaml}': 'prettier --write',
	'**/*': 'inflint -c ./inflint.config.cjs',
};
