/**
 * The function returns the intersection of two arrays in O(n+m) complexity
 * @param input1 an array of numbers or string
 * @param input2 an array of numbers or string
 * @returns the intersection result
 * @author Tal Rofe
 */
export const intersection = (input1: (string | number)[], input2: (string | number)[]) => {
	const intersectObject: Record<string | number, 0 | 1> = {};

	input1.forEach((value) => (intersectObject[value] = 0));
	input2.forEach((value) => {
		if (intersectObject[value] === 0) {
			intersectObject[value] = 1;
		}
	});

	return Object.keys(intersectObject).reduce<(string | number)[]>((final, key) => {
		if (intersectObject[key] === 1) {
			return [...final, key];
		}

		return final;
	}, []);
};
