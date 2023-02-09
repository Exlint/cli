import React from 'react';
import spinners from 'cli-spinners';
import { Task, TaskList } from 'ink-task-list';

import type { IUseTasks } from '@/interfaces/use-tasks';

interface IProps {
	readonly tasks: IUseTasks;
}

const UseTasksView: React.FC<IProps> = (props: React.PropsWithChildren<IProps>) => {
	return (
		<TaskList>
			{Object.keys(props.tasks).map((task, index) => (
				<Task key={index} label={task} state={props.tasks[task]} spinner={spinners.dots} />
			))}
		</TaskList>
	);
};

export default UseTasksView;
