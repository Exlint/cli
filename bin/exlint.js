#!/usr/bin/env node

// to use V8's code cache to speed up instantiation time
require('v8-compile-cache');

function onFatalError() {
	process.exitCode = 1;
}

process.on('uncaughtException', onFatalError);
process.on('unhandledRejection', onFatalError);

require('../dist/index');
