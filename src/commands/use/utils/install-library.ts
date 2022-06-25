import { exec } from 'child_process';
import util from 'util';

import { INSTALLATION_TIMEOUT } from '../models/install-library';

const asyncExec = util.promisify(exec);

export const installLibraries = async (projectFolderPath: string, libraryNames: string[]) => {
	await asyncExec(`npm i -D ${libraryNames.join(' ')}`, {
		cwd: projectFolderPath,
		timeout: INSTALLATION_TIMEOUT,
	});
};
