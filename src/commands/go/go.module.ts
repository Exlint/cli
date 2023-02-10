import { Module } from '@nestjs/common';

import { UseModule } from '@/modules/use/use.module';
import LoggerService from '@/services/logger/logger.service';
import { ApiService } from '@/services/api/api.service';
import { RunModule } from '@/modules/run/run.module';

import { GoCommand } from './go.command';

@Module({ imports: [UseModule, RunModule], providers: [GoCommand, LoggerService, ApiService] })
export class GoCommandModule {}
