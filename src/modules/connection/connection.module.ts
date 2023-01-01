import { Global, Module } from '@nestjs/common';

import { ConnectionService } from './connection.service';

@Global()
@Module({ providers: [ConnectionService], exports: [ConnectionService] })
export class ConnectionModule {}
