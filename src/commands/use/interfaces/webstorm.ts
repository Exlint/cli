import { IUnknown } from '@/interfaces/unknown';

interface IWorkspaceNode extends IUnknown {
	keyToString?: Record<string, unknown>;
}

interface IWorkspaceComponent extends IUnknown {
	$?: {
		name?: string;
	} & IUnknown;
	_?: IWorkspaceNode | string;
}

export interface IWorkspace extends IUnknown {
	project?: {
		component?: IWorkspaceComponent[];
	} & IUnknown;
}
