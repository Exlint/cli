import React from 'react';

import PendingAuthView from './PendingAuth.view';

interface IProps {
	readonly link: string;
}

const PendingAuth: React.FC<IProps> = (props: React.PropsWithChildren<IProps>) => {
	return <PendingAuthView link={props.link} />;
};

export default PendingAuth;
