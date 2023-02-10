import { Module } from '@nestjs/common';

import { ExlintConfigService } from '@/services/exlint-config/exlint-config.service';

import { RunService } from './run.service';

@Module({ providers: [RunService, ExlintConfigService], exports: [RunService] })
export class RunModule {}
