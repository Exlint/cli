import path from 'node:path';

import fs from 'fs-extra';

import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';

const cleanVscodeSettings = (settings: Record<string, unknown>) => {
	Object.keys(settings).forEach((objectKey) => {
		const value = settings[objectKey];

		if (typeof value === 'string' && value.startsWith(EXLINT_FOLDER_PATH)) {
			delete settings[objectKey];

			return;
		}

		if (value && typeof value === 'object' && Object.keys(value).length > 0) {
			cleanVscodeSettings(value as Record<string, unknown>);

			return;
		}

		if (Array.isArray(value)) {
			value.forEach((item) => {
				if (item && typeof item === 'object' && Object.keys(item).length > 0) {
					cleanVscodeSettings(item as Record<string, unknown>);

					return;
				}
			});
		}
	});
};

const clearTemporaryGroups = async (groupId: string) => {
	const candidateDirectories = await fs.readdir(EXLINT_FOLDER_PATH);

	const matchingDirectories = candidateDirectories.filter(
		(item) => item.startsWith('tmp-') && item !== groupId,
	);

	await Promise.all(
		matchingDirectories.map((directory) => {
			const directoryToRemovePath = path.join(EXLINT_FOLDER_PATH, directory);

			return fs.remove(directoryToRemovePath);
		}),
	);
};

const resetVscodeSettings = async () => {
	const vsCodeSettingsFilePath = path.join(process.cwd(), '.vscode', 'settings.json');
	const doesVsCodeSettingsFileExist = await fs.pathExists(vsCodeSettingsFilePath);

	if (doesVsCodeSettingsFileExist) {
		const currentVsCodeSettingsContent = await fs.readJson(vsCodeSettingsFilePath).catch(() => ({}));

		cleanVscodeSettings(currentVsCodeSettingsContent);
		await fs.outputJson(vsCodeSettingsFilePath, currentVsCodeSettingsContent);
	}
};

export const clearPreData = async (groupId: string) => {
	await Promise.all([resetVscodeSettings(), clearTemporaryGroups(groupId)]);
};
