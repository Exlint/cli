import type { ISpawnResult } from '../interfaces/spawn-result';
import { getDepcheckOutput } from './depcheck-output';
import { getPrettierOutput } from './prettier-output';
import { getInflintOutput } from './inflint-output';
import { getEslintOutput } from './eslint-output';
import { getStylelintOutput } from './stylelint-output';

interface IRelevantResult extends ISpawnResult {
	readonly name: string;
}

export const getLibsOutput = async (projectId: string, withFix: boolean) => {
	const librariesResult = await Promise.all([
		getDepcheckOutput(projectId),
		getPrettierOutput(projectId, withFix),
		getInflintOutput(projectId),
		getEslintOutput(projectId, withFix),
		getStylelintOutput(projectId, withFix),
	]);

	const relevantLibrariesResult = librariesResult.filter(Boolean) as IRelevantResult[];

	return relevantLibrariesResult;
};
