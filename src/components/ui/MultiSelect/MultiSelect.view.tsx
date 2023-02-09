import { Box, Text } from 'ink';
import React from 'react';

import type { ISelectItem } from './interfaces/select-item';

interface IProps {
	readonly label: JSX.Element;
	readonly items: ISelectItem[];
	readonly highlightedItemIndex: number;
	readonly selectedValues: ISelectItem['value'][];
}

const MultiSelectView: React.FC<IProps> = (props: React.PropsWithChildren<IProps>) => {
	return (
		<Box display="flex" flexDirection="column" marginTop={1}>
			{props.label}

			{props.items.map((item, index) => (
				<Box key={item.value} display="flex" flexDirection="row">
					<Text color="white">{index === props.highlightedItemIndex ? '❯' : ' '}</Text>
					<Text color="magenta">
						&nbsp;
						{props.selectedValues.includes(item.value) ? '◉' : '◯'}
						&nbsp;
					</Text>
					<Text color={props.selectedValues.includes(item.value) ? 'white' : 'gray'}>
						{item.label}
					</Text>
				</Box>
			))}
		</Box>
	);
};

export default MultiSelectView;
