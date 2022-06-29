import { Module } from '@nestjs/common';

import { AuthCommand } from './Auth';

@Module({ providers: [AuthCommand] })
export class AuthModule {}
