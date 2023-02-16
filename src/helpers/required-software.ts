import util from 'node:util';
import { execFile } from 'node:child_process';

import envinfo from 'envinfo';

const asyncExecFile = util.promisify(execFile);

export const getNodeJsVersion = async () => {
	const nodeJsInfo = await envinfo.helpers.getNodeInfo();

	return nodeJsInfo[1]!;
};

export const getNpmVersion = async () => {
	const npmInfo = await envinfo.helpers.getnpmInfo();

	return npmInfo[1]!;
};

export const ensureRequiredSoftware = async () => {
	const [nodeJsVersion, npmVersion] = await Promise.all([getNodeJsVersion(), getNpmVersion()]);

	return nodeJsVersion !== 'Not Found' && npmVersion !== 'Not Found';
};

export const isVsCodeInstalled = async () => {
	// * "envinfo" library relies on the fact that "code" command will be availble, which isn't neccessarily on macOS
	if (process.platform !== 'darwin') {
		const vsCodeInfo = await envinfo.helpers.getVSCodeInfo();

		return vsCodeInfo[1] !== 'Not Found';
	}

	const vsCodeFolderOutput = await asyncExecFile('/usr/bin/mdfind', [
		'kMDItemCFBundleIdentifier = "com.microsoft.VSCode"',
	]);

	if (vsCodeFolderOutput.stderr) {
		return false;
	}

	return true;
};
