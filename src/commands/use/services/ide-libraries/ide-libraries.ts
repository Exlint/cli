import { ILibrary } from '@/interfaces/library';

abstract class IdeLibrares {
	protected abstract adjustLocal(projectId: string, libs: ILibrary[]): Promise<void>;
}

export default IdeLibrares;
