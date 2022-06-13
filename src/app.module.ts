import { Module } from '@nestjs/common';

import { AuthCommand } from './commands/auth/Auth';
import { RunCommand } from './commands/run/Run';
import { UseCommand } from './commands/use/Use';
import { ApiModule } from './modules/api/api.module';
import { ConfigModule } from './modules/config/config.module';
import { ConnectionModule } from './modules/connection/connection.module';
import { ExlintConfigModule } from './modules/exlint-config/exlint-config.module';

@Module({
	imports: [ConfigModule, ConnectionModule, ApiModule, ExlintConfigModule],
	providers: [AuthCommand, UseCommand, RunCommand],
})
export class AppModule {}
