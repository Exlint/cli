import path from 'path';

import fs from 'fs-extra';
import chalk from 'chalk';

import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';
import { ILibrary } from '@/interfaces/library';

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

const getPrettierOutput = async (projectId: string) => {
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

const getLibraryOutput = async (projectId: string, library: ILibrary) => {
	const libraryConfigFileName = `.${library}rc.json`;
	const libraryConfigPath = path.join(EXLINT_FOLDER_PATH, projectId, libraryConfigFileName);
	const libraryPatternPath = path.join(EXLINT_FOLDER_PATH, projectId, `.exlint-${library}-pattern`);
	const isLibraryConfigured = await fs.pathExists(libraryConfigPath);

	if (isLibraryConfigured) {
		const libraryPattern = await fs
			.readFile(libraryPatternPath, { encoding: 'utf-8' })
			.catch(() => '**/*');

		const libraryRunOutput = await spawnLib(library, ['--config', libraryConfigPath, libraryPattern]);

		return {
			output: `${chalk[libraryRunOutput.success ? 'greenBright' : 'red'].bold(
				`--- ${library[0]!.toUpperCase() + library.substring(1)} output ---`,
			)}\n\n${libraryRunOutput.output}`,
			success: libraryRunOutput.success,
		};
	}

	return {
		output: '',
		success: true,
	};
};

export const getLibsOutput = async (projectId: string) => {
	const librariesResult = await Promise.all([
		getDepcheckOutput(projectId),
		getPrettierOutput(projectId),
		getLibraryOutput(projectId, 'eslint'),
		getLibraryOutput(projectId, 'inflint'),
		getLibraryOutput(projectId, 'stylelint'),
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
