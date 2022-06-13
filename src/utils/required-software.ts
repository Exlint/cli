import envinfo from 'envinfo';

export const ensureRequiredSoftware = async () => {
	const [nodeInfo, npmInfo] = await Promise.all([
		envinfo.helpers.getNodeInfo(),
		envinfo.helpers.getnpmInfo(),
	]);

	return nodeInfo[2] !== 'Not Found' && npmInfo[2] !== 'Not Found';
};

export const isVsCodeInstalled = async () => {
	const vsCodeInfo = await envinfo.helpers.getVSCodeInfo();

	return vsCodeInfo[2] !== 'Not Found';
};
