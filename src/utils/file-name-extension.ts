import type { ICodeType } from '../interfaces/code-type';

export const getFileNameExtension = (isFormConfiguration: boolean, codeType: ICodeType) => {
	if (isFormConfiguration) {
		return 'json';
	}

	return codeType?.toLowerCase() || 'json';
};
