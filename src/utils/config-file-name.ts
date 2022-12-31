export const findConfigFileName = (files: string[], library: string) => {
	const result = files.find((file) => file.includes(`${library}rc`));

	if (!result) {
		throw new Error(`Unable to find configuration file name of library: "${library}"`);
	}

	return result;
};
