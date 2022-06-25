import { ILibrary } from '@/interfaces/library';

abstract class IdeLibrares {
	protected abstract adjustLocalImpl(projectId: string, libs: ILibrary[]): Promise<void>;

	public async adjustLocal(projectId: string, libs: ILibrary[]) {
		if (libs.length === 0) {
			return;
		}

		await this.adjustLocalImpl(projectId, libs);
	}
}

export default IdeLibrares;
