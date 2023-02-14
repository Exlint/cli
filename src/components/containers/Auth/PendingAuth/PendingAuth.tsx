import React from 'react';

import PendingAuthView from './PendingAuth.view';

interface IProps {
	readonly debugMode: boolean;
	readonly link: string;
}

const PendingAuth: React.FC<IProps> = (props: React.PropsWithChildren<IProps>) => {
	return <PendingAuthView debugMode={props.debugMode} link={props.link} />;
};

export default PendingAuth;
