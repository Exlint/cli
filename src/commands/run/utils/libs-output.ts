import path from 'path';

import fs from 'fs-extra';

import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';

import { spawnLib } from './spawn-lib';

export const getEslintOutput = async (projectId: string) => {
	const eslintConfigPath = path.join(EXLINT_FOLDER_PATH, projectId, '.eslintrc.json');
	const eslintPatternPath = path.join(EXLINT_FOLDER_PATH, projectId, '.exlint-eslint-pattern');

	const [isEslintConfigured, eslintPattern] = await Promise.all([
		fs.pathExists(eslintConfigPath),
		fs.readFile(eslintPatternPath, { encoding: 'utf-8' }).catch(() => null),
	]);

	if (isEslintConfigured && eslintPattern) {
		const eslintRunOutput = await spawnLib(projectId, 'eslint', [
			'-c',
			'./.eslintrc.json',
			eslintPattern,
		]);

		return eslintRunOutput;
	}

	return '';
};

export const getPrettierOutput = async (projectId: string) => {
	const prettierConfigPath = path.join(EXLINT_FOLDER_PATH, projectId, '.prettierrc.json');
	const prettierPatternPath = path.join(EXLINT_FOLDER_PATH, projectId, '.exlint-prettier-pattern');

	const [isPrettierConfigured, prettierPattern] = await Promise.all([
		fs.pathExists(prettierConfigPath),
		fs.readFile(prettierPatternPath, { encoding: 'utf-8' }).catch(() => null),
	]);

	if (isPrettierConfigured && prettierPattern) {
		const prettierRunOutput = await spawnLib(projectId, 'prettier', [
			'-c',
			'./.prettierrc.json',
			prettierPattern,
		]);

		return prettierRunOutput;
	}

	return '';
};

export const getStylelintOutput = async (projectId: string) => {
	const stylelintConfigPath = path.join(EXLINT_FOLDER_PATH, projectId, '.stylelintrc.json');
	const stylelintPatternPath = path.join(EXLINT_FOLDER_PATH, projectId, '.stylelint-prettier-pattern');

	const [isStylelintConfigured, stylelintPattern] = await Promise.all([
		fs.pathExists(stylelintConfigPath),
		fs.readFile(stylelintPatternPath, { encoding: 'utf-8' }).catch(() => null),
	]);

	if (isStylelintConfigured && stylelintPattern) {
		const stylelintRunOutput = await spawnLib(projectId, 'stylelint', [
			'-c',
			'./.stylelintrc.json',
			stylelintPattern,
		]);

		return stylelintRunOutput;
	}

	return '';
};
