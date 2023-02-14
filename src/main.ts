import { Logger } from '@nestjs/common';
import { CommandFactory } from 'nest-commander';

import { AppModule } from './app.module';

await CommandFactory.run(AppModule, {
	logger: process.env.NODE_ENV === 'development' ? new Logger() : false,
});
