import { execFile } from 'node:child_process';
import util from 'node:util';

import { EXLINT_FOLDER_PATH } from '@/models/exlint-folder';

import { INSTALLATION_TIMEOUT } from '../models/install-library';

const asyncExecFile = util.promisify(execFile);

export const installLibraries = async (libraryNames: string[]) => {
	const transformedLibraryNames = libraryNames.map((libName) =>
		libName.toLowerCase() === 'inflint' ? '@exlint.io/inflint' : libName.toLowerCase(),
	);

	if (transformedLibraryNames.includes('eslint') && transformedLibraryNames.includes('prettier')) {
		transformedLibraryNames.push('eslint-config-prettier');
	}

	if (transformedLibraryNames.includes('stylelint')) {
		transformedLibraryNames.push('stylelint-config-standard-scss');
	}

	await asyncExecFile('npm', ['i', '-D', ...transformedLibraryNames], {
		cwd: EXLINT_FOLDER_PATH,
		timeout: INSTALLATION_TIMEOUT,
		shell: true,
	});
};
