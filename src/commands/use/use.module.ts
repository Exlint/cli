import { Module } from '@nestjs/common';

import { VsCodeLibrariesService } from './services/ide-libraries/vscode-libraries.service';
import { WebstormLibrariesService } from './services/ide-libraries/webstorm-libraries.service';
import { UseCommand } from './Use';

@Module({ providers: [UseCommand, VsCodeLibrariesService, WebstormLibrariesService] })
export class UseModule {}
