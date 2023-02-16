import { Module } from '@nestjs/common';

import { UseModule } from '@/modules/use/use.module';
import LoggerService from '@/services/logger/logger.service';
import { ApiService } from '@/services/api/api.service';
import { UseCommand } from './use.command';

@Module({ imports: [UseModule], providers: [UseCommand, LoggerService, ApiService] })
export class UseCommandModule {}
