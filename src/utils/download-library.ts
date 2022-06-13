import { exec } from 'child_process';
import util from 'util';

const asyncExec = util.promisify(exec);

const MINUTE = 1000 * 60;

const INSTALLATION_TIMEOUT = 2 * MINUTE;

export const downloadLibraries = async (projectFolderPath: string, ...libraryNames: string[]) => {
	await asyncExec(`npm i -D ${libraryNames.join(' ')}`, {
		cwd: projectFolderPath,
		timeout: INSTALLATION_TIMEOUT,
	});
};
