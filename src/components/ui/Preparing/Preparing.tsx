import React from 'react';

import PreparingView from './Preparing.view';

interface IProps {
	readonly debugMode: boolean;
}

const Preparing: React.FC<IProps> = (props: React.PropsWithChildren<IProps>) => {
	return <PreparingView debugMode={props.debugMode} />;
};

export default Preparing;
