import { Module } from '@nestjs/common';

import { RunCommand } from './Run';

@Module({ providers: [RunCommand] })
export class RunModule {}
