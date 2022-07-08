import chalk from 'chalk';

import { getDepcheckOutput } from './depcheck-output';
import { getPrettierOutput } from './prettier-output';
import { getInflintOutput } from './inflint-output';
import { getEslintOutput } from './eslint-output';
import { getStylelintOutput } from './stylelint-output';

export const getLibsOutput = async (projectId: string, withFix: boolean) => {
	const librariesResult = await Promise.all([
		getDepcheckOutput(projectId),
		getPrettierOutput(projectId, withFix),
		getInflintOutput(projectId),
		getEslintOutput(projectId, withFix),
		getStylelintOutput(projectId, withFix),
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
