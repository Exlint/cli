import { Global, Module } from '@nestjs/common';

import { ExlintConfigService } from './exlint-config.service';

@Global()
@Module({ providers: [ExlintConfigService], exports: [ExlintConfigService] })
export class ExlintConfigModule {}
