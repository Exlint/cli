import { ILibrary } from '@/interfaces/library';

export const vsCodeExtensions: Partial<Record<ILibrary, string>> = {
	eslint: 'dbaeumer.vscode-eslint',
	prettier: 'esbenp.prettier-vscode',
	stylelint: 'stylelint.vscode-stylelint',
};
