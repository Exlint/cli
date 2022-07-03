import { spawn } from 'child_process';

import { ILibrary } from '@/interfaces/library';

import { ISpawnResult } from '../interfaces/spawn-result';

export const spawnLib = async (libraryName: ILibrary, args: string[]) => {
	const commandOutput = await new Promise<ISpawnResult>((resolve) => {
		let output = '';

		const spawner = spawn('npx', [libraryName, ...args], {
			cwd: process.cwd(),
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
