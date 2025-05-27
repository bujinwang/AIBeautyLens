import { Module } from '@nestjs/common';
import { AppLoggerService } from '../services/logging.service';

@Module({
  providers: [AppLoggerService],
  exports: [AppLoggerService],
})
export class LoggingModule {} 