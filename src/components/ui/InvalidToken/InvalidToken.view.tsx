import React from 'react';
import { Text } from 'ink';

interface IProps {}

const InvalidTokenView: React.FC<IProps> = () => {
	return (
		<Text color="red" bold>
			Unauthorized. Please run &quot;exlint auth&quot;
		</Text>
	);
};

export default InvalidTokenView;
