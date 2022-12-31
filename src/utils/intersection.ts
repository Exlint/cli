/**
 * The function returns the intersection of two arrays in O(n+m) complexity
 * @param input1 an array of string
 * @param input2 an array of string
 * @returns the intersection result
 * @author Tal Rofe
 */
export const intersection = (input1: string[], input2: string[], caseSensetive: boolean) => {
	const intersectObject: Record<string, 0 | 1> = {};

	input1.forEach((value) => {
		const key = caseSensetive ? value : value.toLowerCase();

		intersectObject[key] = 0;
	});
	input2.forEach((value) => {
		const key = caseSensetive ? value : value.toLowerCase();

		if (intersectObject[key] === 0) {
			intersectObject[key] = 1;
		}
	});

	return Object.keys(intersectObject).reduce<string[]>((final, key) => {
		if (intersectObject[key] === 1) {
			return [...final, key];
		}

		return final;
	}, []);
};
