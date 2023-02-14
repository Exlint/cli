import { Module } from '@nestjs/common';

import { UseModule } from '@/modules/use/use.module';
import LoggerService from '@/services/logger/logger.service';
import { AuthModule } from '@/modules/auth/auth.module';
import { ApiService } from '@/services/api/api.service';
import { RunModule } from '@/modules/run/run.module';
import { ExlintConfigService } from '@/services/exlint-config/exlint-config.service';

import { GoCommand } from './go.command';

@Module({
	imports: [UseModule, RunModule, AuthModule],
	providers: [GoCommand, LoggerService, ApiService, ExlintConfigService],
})
export class GoCommandModule {}
