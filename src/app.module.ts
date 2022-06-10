import { Module } from '@nestjs/common';

import { AuthCommand } from './commands/auth/Auth';
import { ConfigModule } from './modules/config/config.module';
import { ConnectionModule } from './modules/connection/connection.module';

@Module({
	imports: [ConfigModule, ConnectionModule],
	providers: [AuthCommand],
})
export class AppModule {}
