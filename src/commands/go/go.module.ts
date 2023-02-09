import { Module } from '@nestjs/common';

import { UseModule } from '@/modules/use/use.module';
import LoggerService from '@/services/logger/logger.service';
import { ApiService } from '@/services/api/api.service';

import { GoCommand } from './go.command';

@Module({ imports: [UseModule], providers: [GoCommand, LoggerService, ApiService] })
export class GoCommandModule {}
