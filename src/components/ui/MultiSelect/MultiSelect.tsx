import React, { useEffect, useState } from 'react';
import { useStdin } from 'ink';

import type { ISelectItem, ISelectItemSelection } from './interfaces/select-item';
import { ARROW_DOWN, ARROW_UP, ENTER, SPACE } from './constants/input';

import MultiSelectView from './MultiSelect.view';

interface IProps {
	readonly items: ISelectItem[];
	readonly onSubmit: (selectedItems: string[]) => void;
}

const MultiSelect: React.FC<IProps> = (props: React.PropsWithChildren<IProps>) => {
	const { stdin, setRawMode } = useStdin();

	const [itemsSelectionState, setItemsSelectionState] = useState<ISelectItemSelection[]>(
		props.items.map((item, index) => ({ ...item, selected: false, isHighlighted: index === 0 })),
	);

	const stdinInputHandler = (data: unknown) => {
		const rawData = String(data);

		if (rawData === ARROW_DOWN) {
			setItemsSelectionState((prev) => {
				const highlightedIndex = prev.findIndex((item) => item.isHighlighted);

				if (highlightedIndex === -1) {
					return prev;
				}

				const clonedPrev = structuredClone(prev);

				clonedPrev[highlightedIndex]!.isHighlighted = false;

				if (highlightedIndex === prev.length - 1) {
					clonedPrev[0]!.isHighlighted = true;
				} else {
					clonedPrev[highlightedIndex + 1]!.isHighlighted = true;
				}

				return clonedPrev;
			});
		}

		if (rawData === ARROW_UP) {
			setItemsSelectionState((prev) => {
				const highlightedIndex = prev.findIndex((item) => item.isHighlighted);

				if (highlightedIndex === -1) {
					return prev;
				}

				const clonedPrev = structuredClone(prev);

				clonedPrev[highlightedIndex]!.isHighlighted = false;

				if (highlightedIndex === 0) {
					clonedPrev[prev.length - 1]!.isHighlighted = true;
				} else {
					clonedPrev[highlightedIndex - 1]!.isHighlighted = true;
				}

				return clonedPrev;
			});
		}

		if (rawData === SPACE) {
			setItemsSelectionState((prev) => {
				const highlightedIndex = prev.findIndex((item) => item.isHighlighted);

				if (highlightedIndex === -1) {
					return prev;
				}

				const clonedPrev = structuredClone(prev);

				clonedPrev[highlightedIndex]!.selected = !prev[highlightedIndex]!.selected;

				return clonedPrev;
			});
		}

		if (rawData === ENTER) {
			const selectedItemsValues = itemsSelectionState
				.filter((item) => item.selected)
				.map((item) => item.value);

			props.onSubmit(selectedItemsValues);
		}
	};

	useEffect(() => {
		setRawMode(true);
		stdin?.on('data', stdinInputHandler);

		return () => {
			stdin?.removeListener('data', stdinInputHandler);
			setRawMode(false);
		};
	}, []);

	return <MultiSelectView itemsSelection={itemsSelectionState} />;
};

export default MultiSelect;
