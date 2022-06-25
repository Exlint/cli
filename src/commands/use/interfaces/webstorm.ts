import { IUnknown } from '@/interfaces/unknown';

interface IWorkspaceComponent extends IUnknown {
	$?: {
		name?: string;
	} & IUnknown;
	_?: {
		keyToString?: Record<string, unknown>;
	} & IUnknown;
}

export interface IWorkspace extends IUnknown {
	project?: {
		component?: IWorkspaceComponent[];
	} & IUnknown;
}
