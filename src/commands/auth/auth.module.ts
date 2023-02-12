import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';
import LoggerService from '@/services/logger/logger.service';

import { AuthCommand } from './auth.command';

@Module({ imports: [AuthModule], providers: [AuthCommand, LoggerService] })
export class AuthCommandModule {}
