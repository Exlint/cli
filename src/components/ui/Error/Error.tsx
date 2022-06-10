import React from 'react';

import ErrorView from './Error.view';

interface IProps {
	readonly message?: string;
}

const Error: React.FC<IProps> = (props: React.PropsWithChildren<IProps>) => {
	return <ErrorView message={props.message} />;
};

export default Error;
