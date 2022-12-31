import { exec } from 'child_process';
import util from 'util';

import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';

import { INSTALLATION_TIMEOUT } from '../models/install-library';

const asyncExec = util.promisify(exec);

export const installLibraries = async (libraryNames: string[]) => {
	const transformedLibraryNames = libraryNames.map((libName) =>
		libName.toLowerCase() === 'inflint' ? '@exlint.io/inflint' : libName.toLowerCase(),
	);

	await asyncExec(`npm i -D ${transformedLibraryNames.join(' ')}`, {
		cwd: EXLINT_FOLDER_PATH,
		timeout: INSTALLATION_TIMEOUT,
	});
};
