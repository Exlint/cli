import { Module } from '@nestjs/common';

import { GoCommand } from './Go';

@Module({ providers: [GoCommand] })
export class GoModule {}
