import { Module } from '@nestjs/common';

import { ExlintConfigService } from '@/services/exlint-config/exlint-config.service';
import LoggerService from '@/services/logger/logger.service';

import { UseService } from './use.service';

@Module({ providers: [UseService, ExlintConfigService, LoggerService], exports: [UseService] })
export class UseModule {}
