#!/usr/bin/env node

const path = require('path');
const os = require('os');

const fs = require('fs-extra');

// to use V8's code cache to speed up instantiation time
require('v8-compile-cache');

const EXLINT_FOLDER_PATH = path.join(os.homedir(), '.exlint');

fs.ensureDir(EXLINT_FOLDER_PATH);

function onFatalError() {
	process.exitCode = 1;
}

process.on('uncaughtException', onFatalError);
process.on('unhandledRejection', onFatalError);

require('../dist/index');
