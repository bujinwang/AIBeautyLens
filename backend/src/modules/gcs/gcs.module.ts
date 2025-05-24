import { Module } from '@nestjs/common';
import { GcsService } from './gcs.service';
import { GcsController } from './gcs.controller';

@Module({
  providers: [GcsService],
  controllers: [GcsController],
  exports: [GcsService],
})
export class GcsModule {}
