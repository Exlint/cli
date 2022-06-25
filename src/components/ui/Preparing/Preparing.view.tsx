import React from 'react';
import { Text } from 'ink';
import Spinner from 'ink-spinner';

interface IProps {}

const PreparingView: React.FC<IProps> = () => {
	return (
		<Text>
			<Spinner type="earth" />
			&nbsp;
			<Text>Preparing...</Text>
		</Text>
	);
};

export default PreparingView;
