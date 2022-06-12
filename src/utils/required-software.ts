import envinfo from 'envinfo';

export const ensureRequiredSoftware = async () => {
	const [nodeInfo, npmInfo] = await Promise.all([
		envinfo.helpers.getNodeInfo(),
		envinfo.helpers.getnpmInfo(),
	]);

	if (nodeInfo[2] === 'Not Found' || npmInfo[2] === 'Not Found') {
		return false;
	}

	return true;
};
