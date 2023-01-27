#!/usr/bin/env node

const path = require('node:path');
const os = require('node:os');

const fs = require('fs-extra');

// To use V8's code cache to speed up instantiation time
require('v8-compile-cache');

const EXLINT_FOLDER_PATH = path.join(os.homedir(), '.exlint');

fs.ensureDir(EXLINT_FOLDER_PATH);

function onFatalError() {
	process.exitCode = 1;
}

process.on('uncaughtException', onFatalError);
process.on('unhandledRejection', onFatalError);

require('../bundle/index');
