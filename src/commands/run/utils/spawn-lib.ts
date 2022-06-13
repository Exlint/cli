import { spawn } from 'child_process';
import path from 'path';

import { ILibrary } from '@/interfaces/library';
import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';

export const spawnLib = async (projectId: string, libraryName: ILibrary, args: string[]) => {
	const projectPath = path.join(EXLINT_FOLDER_PATH, projectId);

	const commandOutput = await new Promise<string>((resolve) => {
		let output = '';

		spawn('npx', [libraryName, ...args], {
			stdio: 'inherit',
			cwd: projectPath,
		})
			.stdout?.on('data', (data) => {
				output += data;
			})
			.on('close', () => resolve(output));
	});

	return commandOutput;
};
