import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AppLoggerService } from './common/services/logging.service';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function bootstrap() {
  // Create custom logger
  const logger = new AppLoggerService();
  
  // Create application with custom logger
  const app = await NestFactory.create(AppModule, {
    logger: logger,
    // Add buffer log for logger initialization
    bufferLogs: true,
  });
  
  // Use custom logger
  app.useLogger(logger);
  
  // Get configuration service
  const configService = app.get(ConfigService);
  
  // Enable CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', '*'),
    credentials: true,
  });
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    // Add helpful validation error messages
    exceptionFactory: (errors) => {
      const formattedErrors = errors.map((error) => {
        const constraints = error.constraints ? Object.values(error.constraints) : ['Invalid value'];
        return `${error.property}: ${constraints.join(', ')}`;
      });
      
      return {
        message: formattedErrors,
        statusCode: 400,
      };
    },
  }));
  
  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  // Global transform interceptor
  app.useGlobalInterceptors(new TransformInterceptor());
  
  // Global prefix
  app.setGlobalPrefix('api');
  
  const port = configService.get('PORT', 3000);
  await app.listen(port);
  
  logger.log(`🚀 AI Beauty Lens Backend running on port ${port}`, 'Bootstrap');
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});