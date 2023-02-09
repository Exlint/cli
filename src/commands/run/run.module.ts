import { Module } from '@nestjs/common';

import LoggerService from '@/services/logger/logger.service';
import { ApiService } from '@/services/api/api.service';
import { ExlintConfigService } from '@/services/exlint-config/exlint-config.service';

import { RunCommand } from './run.command';

@Module({ providers: [RunCommand, LoggerService, ApiService, ExlintConfigService] })
export class RunCommandModule {}
