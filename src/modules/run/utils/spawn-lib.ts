import { spawn } from 'node:child_process';
import path from 'path';

import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';

import type { ISpawnResult } from '../interfaces/spawn-result';

export const spawnLib = async (libraryName: string, args: string[]) => {
	const libraryBinaryPath = path.join(EXLINT_FOLDER_PATH, 'node_modules', '.bin', libraryName);

	const commandOutput = await new Promise<ISpawnResult>((resolve) => {
		let output = '';

		const spawner = spawn(libraryBinaryPath, [...args, '--color'], {
			cwd: process.cwd(),
			windowsHide: true,
			shell: true,
		});

		spawner.stdout?.on('data', (data) => {
			output += data;
		});
		spawner.stderr?.on('data', (data) => {
			output += data;
		});
		spawner.on('close', (exitCode: number) =>
			resolve({ output: output.trim(), success: exitCode === 0 }),
		);
	});

	return commandOutput;
};
