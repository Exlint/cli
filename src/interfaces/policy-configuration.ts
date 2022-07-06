interface IExlintPolicyConfiguration {
	__EXLINT_FILES_PATTERN__?: string;
	__EXLINT_IGNORE_FILE__?: string[];
}

export type IPolicyConfiguration = (Record<string, unknown> & IExlintPolicyConfiguration) | null;
