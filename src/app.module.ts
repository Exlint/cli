import { Module } from '@nestjs/common';

import { BaseCommandModule } from './commands/base/base.module';
import { AuthCommandModule } from './commands/auth/auth.module';
import { UseCommandModule } from './commands/use/use.module';
import { RunCommandModule } from './commands/run/run.module';
import { GoCommandModule } from './commands/go/go.module';

@Module({
	imports: [BaseCommandModule, AuthCommandModule, UseCommandModule, RunCommandModule, GoCommandModule],
})
export class AppModule {}
