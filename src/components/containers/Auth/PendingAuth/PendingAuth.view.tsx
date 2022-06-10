import { Newline, Text } from 'ink';
import Spinner from 'ink-spinner';
import React from 'react';

interface IProps {}

const PendingAuthView: React.FC<IProps> = () => {
	return (
		<Text>
			<Text>You are redirected to our auth page, please log in.</Text>
			<Newline />
			<Text>
				Once the auth is complete, return back and start using <Text color="blue">Exlint!</Text>
			</Text>
			<Newline />
			<Spinner type="dots" />
			&nbsp;<Text>Wating...</Text>
		</Text>
	);
};

export default PendingAuthView;
