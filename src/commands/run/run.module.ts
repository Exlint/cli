import { Module } from '@nestjs/common';

import { RunModule } from '@/modules/run/run.module';
import LoggerService from '@/services/logger/logger.service';
import { ApiService } from '@/services/api/api.service';

import { RunCommand } from './run.command';

@Module({ imports: [RunModule], providers: [RunCommand, LoggerService, ApiService] })
export class RunCommandModule {}
