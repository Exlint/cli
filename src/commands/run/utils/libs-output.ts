import path from 'path';

import fs from 'fs-extra';
import chalk from 'chalk';

import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';

import { spawnLib } from './spawn-lib';

const getDepcheckOutput = async (projectId: string) => {
	const depcheckConfigFileName = '.depcheckrc.json';
	const depcheckConfigPath = path.join(EXLINT_FOLDER_PATH, projectId, depcheckConfigFileName);
	const isDepcheckConfigured = await fs.pathExists(depcheckConfigPath);

	if (isDepcheckConfigured) {
		const depcheckRunOutput = await spawnLib('depcheck', ['--config', depcheckConfigPath]);

		return {
			output: `${chalk[depcheckRunOutput.success ? 'greenBright' : 'red'].bold(
				'--- Depcheck output ---',
			)}\n\n${depcheckRunOutput.output}`,
			success: depcheckRunOutput.success,
		};
	}

	return {
		output: '',
		success: true,
	};
};

const getPrettierOutput = async (projectId: string, withFix: boolean) => {
	const libraryConfigFileName = '.prettierrc.json';
	const libraryConfigPath = path.join(EXLINT_FOLDER_PATH, projectId, libraryConfigFileName);
	const libraryPatternPath = path.join(EXLINT_FOLDER_PATH, projectId, '.exlint-prettier-pattern');
	const isLibraryConfigured = await fs.pathExists(libraryConfigPath);

	if (isLibraryConfigured) {
		const libraryPattern = await fs
			.readFile(libraryPatternPath, { encoding: 'utf-8' })
			.catch(() => '**/*');

		const libraryRunOutput = await spawnLib('prettier', [
			'--config',
			libraryConfigPath,
			libraryPattern,
			'--check',
			'--ignore-unknown',
			...(withFix ? ['--write'] : []),
		]);

		return {
			output: `${chalk[libraryRunOutput.success ? 'greenBright' : 'red'].bold(
				'--- Prettier output ---',
			)}\n\n${libraryRunOutput.output}`,
			success: libraryRunOutput.success,
		};
	}

	return {
		output: '',
		success: true,
	};
};

const getInflintOutput = async (projectId: string) => {
	const libraryConfigFileName = '.inflintrc.json';
	const libraryConfigPath = path.join(EXLINT_FOLDER_PATH, projectId, libraryConfigFileName);
	const isLibraryConfigured = await fs.pathExists(libraryConfigPath);

	if (isLibraryConfigured) {
		const libraryRunOutput = await spawnLib('@exlint.io/inflint', ['--config', libraryConfigPath]);

		return {
			output: `${chalk[libraryRunOutput.success ? 'greenBright' : 'red'].bold(
				'--- Inflint output ---',
			)}\n\n${libraryRunOutput.output}`,
			success: libraryRunOutput.success,
		};
	}

	return {
		output: '',
		success: true,
	};
};

const getLibraryOutput = async (projectId: string, library: 'eslint' | 'stylelint', withFix: boolean) => {
	const libraryConfigFileName = `.${library}rc.json`;
	const libraryConfigPath = path.join(EXLINT_FOLDER_PATH, projectId, libraryConfigFileName);
	const libraryPatternPath = path.join(EXLINT_FOLDER_PATH, projectId, `.exlint-${library}-pattern`);
	const isLibraryConfigured = await fs.pathExists(libraryConfigPath);

	if (isLibraryConfigured) {
		const libraryPattern = await fs
			.readFile(libraryPatternPath, { encoding: 'utf-8' })
			.catch(() => '**/*');

		const libraryRunOutput = await spawnLib(library, [
			'--config',
			libraryConfigPath,
			libraryPattern,
			...(withFix ? ['--fix'] : []),
		]);

		const libraryBrand = library === 'eslint' ? 'ESLint' : 'Stylelint';

		return {
			output: `${chalk[libraryRunOutput.success ? 'greenBright' : 'red'].bold(
				`--- ${libraryBrand} output ---`,
			)}\n\n${libraryRunOutput.output}`,
			success: libraryRunOutput.success,
		};
	}

	return {
		output: '',
		success: true,
	};
};

export const getLibsOutput = async (projectId: string, withFix: boolean) => {
	const librariesResult = await Promise.all([
		getDepcheckOutput(projectId),
		getPrettierOutput(projectId, withFix),
		getInflintOutput(projectId),
		getLibraryOutput(projectId, 'eslint', withFix),
		getLibraryOutput(projectId, 'stylelint', withFix),
	]);

	const relevantLibrariesResult = librariesResult.filter((libResult) => Boolean(libResult.output));
	const librariesOutput = relevantLibrariesResult.map((libOutput) => libOutput.output);
	const isSuccessful = relevantLibrariesResult.every((result) => result.success);

	const messageIcon = isSuccessful ? '✔' : '✖';
	const indicatingMessage = isSuccessful ? 'successfully' : 'with a failure';

	const footerMessage = chalk[isSuccessful ? 'greenBright' : 'red'].bold(
		`${messageIcon} Exlint ran ${indicatingMessage}`,
	);

	return [...librariesOutput, footerMessage].join('\n\n');
};
