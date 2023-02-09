import { Module } from '@nestjs/common';

import LoggerService from '@/services/logger/logger.service';

import { AuthCommand } from './auth.command';

@Module({ providers: [AuthCommand, LoggerService] })
export class AuthCommandModule {}
