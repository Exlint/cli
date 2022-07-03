import { exec } from 'child_process';
import util from 'util';

import { ILibrary } from '@/interfaces/library';

import { INSTALLATION_TIMEOUT } from '../models/install-library';

const asyncExec = util.promisify(exec);

export const installLibraries = async (projectFolderPath: string, libraryNames: ILibrary[]) => {
	const transformedLibraryNames = libraryNames.map((libName) =>
		libName === 'inflint' ? '@exlint.io/inflint' : libName,
	);

	await asyncExec(`npm i -D ${transformedLibraryNames.join(' ')}`, {
		cwd: projectFolderPath,
		timeout: INSTALLATION_TIMEOUT,
	});
};
