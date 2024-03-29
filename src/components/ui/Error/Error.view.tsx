import { Text } from 'ink';
import React from 'react';

interface IProps {
	readonly message?: string;
}

const ErrorView: React.FC<IProps> = (props: React.PropsWithChildren<IProps>) => {
	return (
		<Text color="red" bold>
			{props.message ?? 'An error occured'}
		</Text>
	);
};

export default ErrorView;
