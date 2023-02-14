import React from 'react';

import type { IUseTasks } from '@/interfaces/use-tasks';

import UseTasksView from './UseTasks.view';

interface IProps {
	readonly tasks: IUseTasks;
}

const UseTasks: React.FC<IProps> = (props: React.PropsWithChildren<IProps>) => {
	return <UseTasksView tasks={props.tasks} />;
};

export default UseTasks;
