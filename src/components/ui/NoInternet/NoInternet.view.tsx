import React from 'react';
import { Text } from 'ink';

interface IProps {}

const NoInternetView: React.FC<IProps> = () => {
	return (
		<Text color="red" bold>
			Please ensure you have internet connection
		</Text>
	);
};

export default NoInternetView;
