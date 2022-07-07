import { exec } from 'child_process';
import util from 'util';

import { ILibrary } from '@/interfaces/library';
import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';

import { INSTALLATION_TIMEOUT } from '../models/install-library';

const asyncExec = util.promisify(exec);

export const installLibraries = async (libraryNames: ILibrary[]) => {
	const transformedLibraryNames = libraryNames.map((libName) =>
		libName === 'inflint' ? '@exlint.io/inflint' : libName,
	);

	await asyncExec(`npm i -D ${transformedLibraryNames.join(' ')}`, {
		cwd: EXLINT_FOLDER_PATH,
		timeout: INSTALLATION_TIMEOUT,
	});
};
