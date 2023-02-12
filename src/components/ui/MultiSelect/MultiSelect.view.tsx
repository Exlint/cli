import { Box, Text } from 'ink';
import React from 'react';

import type { ISelectItem } from './interfaces/select-item';

interface IProps {
	readonly single: boolean;
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
					<Text color="white">{index === props.highlightedItemIndex ? '❯' : ' '}&nbsp;</Text>
					{!props.single && (
						<Text color="magenta">
							{props.selectedValues.includes(item.value) ? '◉' : '◯'}
							&nbsp;
						</Text>
					)}

					{!props.single ? (
						<Text color={props.selectedValues.includes(item.value) ? 'white' : 'gray'}>
							{item.label}
						</Text>
					) : (
						<Text color={props.highlightedItemIndex === index ? 'white' : 'gray'}>
							{item.label}
						</Text>
					)}
				</Box>
			))}
		</Box>
	);
};

export default MultiSelectView;
