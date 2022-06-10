import { Global, Module } from '@nestjs/common';
import { ConnectionService } from './connection.service';

@Global()
@Module({ providers: [ConnectionService] })
export class ConnectionModule {}
