module.exports = {
	root: true,
	env: {
		node: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:import/typescript',
		'prettier',
	],
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 12,
		project: './tsconfig.eslint.json',
		tsconfigRootDir: __dirname,
		sourceType: 'module',
		extraFileExtensions: ['.cjs'],
	},
	plugins: ['@typescript-eslint', 'unused-imports', 'import', 'node', 'react'],
	rules: {
		'max-lines': ['error', { max: 250, skipBlankLines: true, skipComments: true }],
		'indent': ['error', 'tab', { SwitchCase: 1 }],
		'quotes': ['error', 'single', { avoidEscape: true }],
		'semi': ['error', 'always'],
		'no-empty': [
			'error',
			{
				allowEmptyCatch: true,
			},
		],
		'no-duplicate-imports': 'error',
		'no-promise-executor-return': 'error',
		'no-self-compare': 'error',
		'no-template-curly-in-string': 'error',
		'no-unreachable-loop': 'error',
		'no-multiple-empty-lines': 'error',
		'no-trailing-spaces': 'error',
		'require-await': 'error',
		'no-var': 'error',
		'no-labels': 'error',
		'no-inline-comments': 'error',
		'eqeqeq': 'error',
		'no-console': 'error',
		'no-eval': 'error',
		'no-implicit-globals': 'error',
		'no-useless-call': 'error',
		'curly': ['error', 'all'],
		'padding-line-between-statements': [
			'error',
			{
				blankLine: 'always',
				prev: [
					'import',

					'let',
					'const',
					'var',

					'return',
					'throw',
					'if',
					'for',
					'switch',
					'continue',
					'break',
					'class',
					'do',
					'try',
					'export',
					'function',
					'while',
					'block',
				],
				next: '*',
			},
			{
				blankLine: 'any',
				prev: ['singleline-let', 'singleline-const', 'singleline-var'],
				next: ['singleline-let', 'singleline-const', 'singleline-var'],
			},
			{
				blankLine: 'any',
				prev: 'import',
				next: 'import',
			},
			{
				blankLine: 'always',
				prev: '*',
				next: [
					'return',
					'throw',
					'if',
					'for',
					'switch',
					'continue',
					'break',
					'class',
					'do',
					'try',
					'export',
					'function',
					'while',
					'block',
				],
			},
		],
		'no-restricted-imports': [
			'error',
			{
				name: 'lodash',
				message: 'The year is not 2015 anymore',
			},
		],
		'jsx-quotes': ['error', 'prefer-double'],

		'@typescript-eslint/no-unused-vars': ['error'],
		'@typescript-eslint/no-empty-interface': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-explicit-any': ['error'],
		'@typescript-eslint/ban-ts-comment': ['error'],
		'@typescript-eslint/ban-tslint-comment': ['error'],
		'@typescript-eslint/no-require-imports': ['error'],
		'@typescript-eslint/no-non-null-assertion': 'off',
		'@typescript-eslint/no-use-before-define': ['error'],

		'react/jsx-fragments': 'error',
		'react/jsx-wrap-multilines': [
			'error',
			{
				declaration: 'parens-new-line',
				assignment: 'parens-new-line',
				return: 'parens-new-line',
				arrow: 'parens-new-line',
				condition: 'parens-new-line',
				logical: 'parens-new-line',
				prop: 'parens-new-line',
			},
		],
		'react/jsx-tag-spacing': ['error', { beforeSelfClosing: 'always' }],
		'react/jsx-sort-props': ['error', { callbacksLast: true, noSortAlphabetically: true }],
		'react/jsx-props-no-spreading': ['error', { exceptions: ['Component'] }],
		'react/jsx-props-no-multi-spaces': 'error',
		'react/jsx-pascal-case': 'error',
		'react/jsx-one-expression-per-line': ['error', { allow: 'single-child' }],
		'react/jsx-no-useless-fragment': 'error',
		'react/jsx-no-script-url': 'error',
		'react/jsx-indent-props': ['error', 'tab'],
		'react/jsx-indent': ['error', 'tab'],
		'react/jsx-equals-spacing': ['error', 'never'],
		'react/jsx-curly-spacing': ['error', { when: 'never', children: { when: 'never' } }],
		'react/jsx-closing-tag-location': 'error',
		'react/jsx-closing-bracket-location': 'error',
		'react/jsx-boolean-value': ['error', 'never'],
		'react/self-closing-comp': 'error',
		'react/void-dom-elements-no-children': 'error',
		'react/style-prop-object': 'error',
		'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
		'react/button-has-type': 'error',
		'react/destructuring-assignment': ['error', 'never'],
		'react/function-component-definition': [
			'error',
			{
				namedComponents: 'arrow-function',
				unnamedComponents: 'arrow-function',
			},
		],
		'react/no-children-prop': ['error'],
		'react/no-deprecated': ['error'],
		'react/no-danger-with-children': ['error'],
		'react/no-multi-comp': ['error'],
		'react/no-unescaped-entities': ['error'],
		'react/no-unknown-property': ['error'],
		'react/prefer-read-only-props': ['error'],
		'react/react-in-jsx-scope': ['error'],
		'react/jsx-handler-names': ['error', { eventHandlerPrefix: false }],
		'react/jsx-key': ['error', { checkKeyMustBeforeSpread: true }],
		'react/jsx-max-depth': ['error', { max: 10 }],
		'react/jsx-no-duplicate-props': ['error'],

		'unused-imports/no-unused-imports': 'error',

		'import/default': ['error'],
		'import/no-absolute-path': ['error'],
		'import/no-self-import': ['error'],
		'import/no-cycle': ['error'],
		'import/no-useless-path-segments': ['error'],
		'import/export': ['error'],
		'import/no-deprecated': ['error'],
		'import/no-extraneous-dependencies': ['error'],
		'import/no-mutable-exports': ['error'],
		'import/no-unused-modules': ['error'],
		'import/no-commonjs': ['error'],
		'import/no-amd': ['error'],
		'import/first': ['error'],
		'import/exports-last': ['error'],
		'import/no-duplicates': ['error'],
		'import/newline-after-import': ['error'],
		'import/no-named-default': ['error'],
		'import/no-anonymous-default-export': ['error'],
		'import/order': [
			'error',
			{
				pathGroups: [
					{
						pattern: '@/**',
						group: 'external',
						position: 'after',
					},
				],
				groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
			},
		],

		'node/no-sync': 'error',
	},
	settings: {
		react: {
			version: 'detect',
		},
	},
	overrides: [
		{
			files: ['**/*.cjs', '**/*.js'],
			rules: {
				'import/no-commonjs': 'off',
				'@typescript-eslint/no-require-imports': 'off',
				'@typescript-eslint/no-var-requires': 'off',
			},
		},
		{
			files: ['commitlint.config.cjs'],
			rules: {
				'max-lines': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
			},
		},
		{
			files: ['./scripts/onboarding.cjs'],
			rules: {
				'no-console': 'off',
			},
		},
		{
			files: ['./bin/exlint.js'],
			rules: {
				'node/no-sync': 'off',
			},
		},
	],
};
