import { IPolicyServer } from '@/interfaces/policy';

abstract class IdeLibrares {
	protected abstract adjustLocal(projectId: string, policies: IPolicyServer[]): Promise<void>;
}

export default IdeLibrares;
