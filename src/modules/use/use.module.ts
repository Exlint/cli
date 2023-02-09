import { Global, Module } from '@nestjs/common';

import { ExlintConfigService } from '@/services/exlint-config/exlint-config.service';

import { UseService } from './use.service';

@Global()
@Module({ providers: [UseService, ExlintConfigService], exports: [UseService] })
export class UseModule {}
