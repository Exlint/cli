import type { IGlobalCommandOptions } from '@/interfaces/global-command-options';

export interface ICommandOptions extends IGlobalCommandOptions {
	readonly fix?: boolean;
}
