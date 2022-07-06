import { ILibrary } from '@/interfaces/library';

import { IPolicyFilesPattern } from '../../interfaces/file-pattern';

abstract class IdeLibrares {
	protected abstract adjustLocal(
		projectId: string,
		libs: ILibrary[],
		policiesFilesPattern: IPolicyFilesPattern,
	): Promise<void>;
}

export default IdeLibrares;
