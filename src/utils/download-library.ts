import { exec } from 'child_process';
import util from 'util';

const asyncExec = util.promisify(exec);

export const downloadLibraries = async (projectFolderPath: string, ...libraryNames: string[]) => {
	await asyncExec(`npm i -D ${libraryNames.join(' ')}`, { cwd: projectFolderPath });
};
