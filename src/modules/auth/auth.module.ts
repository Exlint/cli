import { Module } from '@nestjs/common';

import LoggerService from '@/services/logger/logger.service';

import { AuthService } from './auth.service';

@Module({ providers: [AuthService, LoggerService], exports: [AuthService] })
export class AuthModule {}
