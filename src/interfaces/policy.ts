import type { ICodeType } from './code-type';
import type { JsonValue } from './json';

export interface IPolicyServer {
	readonly library: string;
	readonly formConfiguration: JsonValue;
	readonly codeConfiguration: string | null;
	readonly isFormConfiguration: boolean;
	readonly codeType: ICodeType;
	readonly lintedList: string[];
	readonly ignoredList: string[];
	readonly rules: {
		readonly name: string;
		readonly configuration: JsonValue;
	}[];
}

export interface IRecommendedPolicyServer {
	readonly library: string;
	readonly configuration: JsonValue;
	readonly lintedList: string[];
	readonly ignoredList: string[];
}
