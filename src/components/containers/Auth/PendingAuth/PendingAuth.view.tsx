import React from 'react';
import { Newline, Text } from 'ink';
import Spinner from 'ink-spinner';

interface IProps {
	readonly debugMode: boolean;
	readonly link: string;
}

const PendingAuthView: React.FC<IProps> = (props: React.PropsWithChildren<IProps>) => {
	return (
		<Text>
			<Newline />
			<Text>You are redirected to our auth page, please log in.</Text>
			<Newline />
			<Text>
				Once the auth is complete, return back and start using&nbsp;
				<Text color="magenta">Exlint!</Text>
			</Text>
			<Newline />
			<Newline />
			<Text>If you can&apos;t wait use this url:</Text>
			<Newline />
			<Text>{props.link}</Text>
			<Newline />
			<Newline />
			{!props.debugMode && <Spinner type="earth" />}
			&nbsp;
			<Text>Waiting...</Text>
		</Text>
	);
};

export default PendingAuthView;
