import { Box, Text } from 'ink';
import React from 'react';

import type { ISelectItemSelection } from './interfaces/select-item';

interface IProps {
	readonly itemsSelection: ISelectItemSelection[];
}

const MultiSelectView: React.FC<IProps> = (props: React.PropsWithChildren<IProps>) => {
	return (
		<Box display="flex" flexDirection="column">
			{props.itemsSelection.map((item) => (
				<Box key={item.value} display="flex" flexDirection="row">
					<Text color="blue">{item.isHighlighted ? '❯' : ' '}</Text>
					<Text color="magenta">
						&nbsp;
						{item.selected ? '◉' : '◯'}
						&nbsp;
					</Text>
					<Text color="white" bold={item.selected}>
						{item.label}
					</Text>
				</Box>
			))}
		</Box>
	);
};

export default MultiSelectView;
