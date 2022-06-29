import { Module } from '@nestjs/common';

import { AuthModule } from './commands/auth/auth.module';
import { RunModule } from './commands/run/run.module';
import { UseModule } from './commands/use/use.module';
import { ApiModule } from './modules/api/api.module';
import { ConfigModule } from './modules/config/config.module';
import { ConnectionModule } from './modules/connection/connection.module';
import { ExlintConfigModule } from './modules/exlint-config/exlint-config.module';

@Module({
	imports: [
		ConfigModule,
		ConnectionModule,
		ApiModule,
		ExlintConfigModule,
		UseModule,
		AuthModule,
		RunModule,
	],
})
export class AppModule {}
