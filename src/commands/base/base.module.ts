import { Module } from '@nestjs/common';

import { BaseCommand } from './base.command';

@Module({ providers: [BaseCommand] })
export class BaseCommandModule {}
