import type { IUnknown } from '@/interfaces/unknown';

interface IWorkspaceNode extends IUnknown {
	keyToString?: Record<string, unknown>;
}

interface IInspectionTool {
	$?: { class?: string } & IUnknown;
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

export interface IProjectDefault extends IUnknown {
	component?: {
		profile?: [{ inspection_tool?: IInspectionTool[] } & IUnknown];
	} & IUnknown;
}
