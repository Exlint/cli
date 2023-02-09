import envinfo from 'envinfo';

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
	const vsCodeInfo = await envinfo.helpers.getVSCodeInfo();

	return vsCodeInfo[1] !== 'Not Found';
};
