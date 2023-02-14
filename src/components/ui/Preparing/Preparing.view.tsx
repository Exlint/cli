import React from 'react';
import { Text } from 'ink';
import Spinner from 'ink-spinner';

interface IProps {
	readonly debugMode: boolean;
}

const PreparingView: React.FC<IProps> = (props: React.PropsWithChildren<IProps>) => {
	return (
		<Text>
			{!props.debugMode && <Spinner type="earth" />}
			&nbsp;
			<Text>Preparing...</Text>
		</Text>
	);
};

export default PreparingView;
