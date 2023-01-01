import { CommandFactory } from 'nest-commander';

import { AppModule } from './app.module';

await CommandFactory.run(AppModule);
