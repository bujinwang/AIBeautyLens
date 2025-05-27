import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

@Injectable()
export class AppLoggerService implements LoggerService {
  private readonly logLevels: LogLevel[] = ['error', 'warn', 'log', 'debug', 'verbose'];
  private readonly logDir: string;
  private readonly errorLogStream: fs.WriteStream;
  private readonly combinedLogStream: fs.WriteStream;

  constructor() {
    // Set current log level from environment variable or default to 'log'
    const currentEnv = process.env.NODE_ENV || 'development';
    const logLevel = process.env.LOG_LEVEL || (currentEnv === 'production' ? 'warn' : 'debug');
    
    // Filter log levels based on the current log level
    const levelIndex = this.logLevels.indexOf(logLevel as LogLevel);
    if (levelIndex >= 0) {
      this.logLevels = this.logLevels.slice(0, levelIndex + 1);
    }

    // Create log directory if it doesn't exist
    this.logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    // Create log streams
    this.errorLogStream = fs.createWriteStream(
      path.join(this.logDir, 'error.log'),
      { flags: 'a' }
    );
    
    this.combinedLogStream = fs.createWriteStream(
      path.join(this.logDir, 'combined.log'),
      { flags: 'a' }
    );

    // Log application startup
    this.log(`Application started in ${currentEnv} environment with log level: ${logLevel}`);
  }

  private formatMessage(level: string, message: any, context?: string): string {
    const timestamp = new Date().toISOString();
    const formattedMessage = typeof message === 'object' 
      ? util.inspect(message, { depth: 5 })
      : message;
    
    return `[${timestamp}] [${level.toUpperCase()}] ${context ? `[${context}] ` : ''}${formattedMessage}`;
  }

  private writeToLogs(level: string, message: string): void {
    const logLine = `${message}\n`;
    
    // Write to combined log
    this.combinedLogStream.write(logLine);
    
    // Write errors and warnings to error log
    if (level === 'error' || level === 'warn') {
      this.errorLogStream.write(logLine);
    }
    
    // Also log to console
    if (level === 'error') {
      console.error(message);
    } else if (level === 'warn') {
      console.warn(message);
    } else {
      console.log(message);
    }
  }

  log(message: any, context?: string): void {
    if (this.logLevels.includes('log')) {
      const formattedMessage = this.formatMessage('info', message, context);
      this.writeToLogs('info', formattedMessage);
    }
  }

  error(message: any, trace?: string, context?: string): void {
    if (this.logLevels.includes('error')) {
      let formattedMessage = this.formatMessage('error', message, context);
      
      if (trace) {
        formattedMessage += `\n${trace}`;
      }
      
      this.writeToLogs('error', formattedMessage);
    }
  }

  warn(message: any, context?: string): void {
    if (this.logLevels.includes('warn')) {
      const formattedMessage = this.formatMessage('warn', message, context);
      this.writeToLogs('warn', formattedMessage);
    }
  }

  debug(message: any, context?: string): void {
    if (this.logLevels.includes('debug')) {
      const formattedMessage = this.formatMessage('debug', message, context);
      this.writeToLogs('debug', formattedMessage);
    }
  }

  verbose(message: any, context?: string): void {
    if (this.logLevels.includes('verbose')) {
      const formattedMessage = this.formatMessage('verbose', message, context);
      this.writeToLogs('verbose', formattedMessage);
    }
  }
} 