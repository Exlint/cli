import React, { useCallback, useEffect, useState } from 'react';
import { useStdin } from 'ink';

import type { ISelectItem } from './interfaces/select-item';
import { ARROW_DOWN, ARROW_UP, ENTER, SPACE } from './constants/input';

import MultiSelectView from './MultiSelect.view';

interface IProps {
	readonly single: boolean;
	readonly label: JSX.Element;
	readonly items: ISelectItem[];
	readonly onSubmit: (selectedItems: string[]) => void;
}

const MultiSelect: React.FC<IProps> = (props: React.PropsWithChildren<IProps>) => {
	const { stdin, setRawMode } = useStdin();

	const [highlightedItemIndexState, setHighlightedItemIndexState] = useState<number>(0);
	const [selectedValuesState, setSelectedValuesState] = useState<string[]>([]);

	const stdinInputHandler = useCallback(
		(data: Buffer) => {
			const rawData = data.toString();

			if (rawData === ARROW_DOWN) {
				process.stdout.cursorTo(process.stdout.rows);
				setHighlightedItemIndexState((prev) => (prev === props.items.length - 1 ? 0 : prev + 1));
			}

			if (rawData === ARROW_UP) {
				process.stdout.cursorTo(process.stdout.rows);
				setHighlightedItemIndexState((prev) => (prev === 0 ? props.items.length - 1 : prev - 1));
			}

			if (!props.single && rawData === SPACE) {
				setSelectedValuesState((prev) => {
					const highlightedItemValue = props.items[highlightedItemIndexState]!.value;
					const index = prev.findIndex((item) => item === highlightedItemValue);
					const newSelectedValues = [...prev];

					if (index === -1) {
						newSelectedValues.push(highlightedItemValue);
					} else {
						newSelectedValues.splice(index, 1);
					}

					return newSelectedValues;
				});
			}

			if (rawData === ENTER) {
				process.stdout.cursorTo(process.stdout.rows);

				if (!props.single) {
					props.onSubmit(selectedValuesState);

					return;
				}

				const selected = props.items[highlightedItemIndexState]!.value;

				props.onSubmit([selected]);
			}
		},
		[highlightedItemIndexState, selectedValuesState],
	);

	useEffect(() => {
		setRawMode(true);
		stdin?.on('data', stdinInputHandler);

		return () => {
			stdin?.removeListener('data', stdinInputHandler);
			setRawMode(false);
		};
	}, [stdinInputHandler]);

	return (
		<MultiSelectView
			single={props.single}
			label={props.label}
			items={props.items}
			highlightedItemIndex={highlightedItemIndexState}
			selectedValues={selectedValuesState}
		/>
	);
};

export default MultiSelect;
