import path from 'node:path';

import fs from 'fs-extra';
import { Logger } from '@nestjs/common';
import { CommandFactory } from 'nest-commander';

import { AppModule } from './app.module';
import { EXLINT_FOLDER_PATH } from './models/exlint-folder';

const packageJsonPath = path.join(EXLINT_FOLDER_PATH, 'package.json');

await fs.outputJson(packageJsonPath, {});

await CommandFactory.run(AppModule, {
	logger: process.env.NODE_ENV === 'development' ? new Logger() : false,
});
