import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AppLoggerService } from './common/services/logging.service';
import * as admin from 'firebase-admin';
import * as bodyParser from 'body-parser';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function bootstrap() {
  // Initialize Firebase Admin SDK
  try {
    // Try to initialize with application default credentials first
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
      console.log('[Bootstrap] Firebase Admin SDK initialized successfully with application default credentials.');
    } catch (defaultCredError) {
      // If that fails, try to initialize with default app
      console.log('[Bootstrap] Failed to initialize with application default credentials, trying default initialization...');
    admin.initializeApp();
      console.log('[Bootstrap] Firebase Admin SDK initialized successfully with default configuration.');
    }
  } catch (error) {
    console.error('[Bootstrap] Error initializing Firebase Admin SDK:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('[Bootstrap] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    // Continue without Firebase - the app will still work but prompt templates will use defaults
    console.log('[Bootstrap] Continuing without Firebase Admin SDK - using default prompts.');
  }

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
  
  // Configure body parser to accept larger payloads
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  
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

  // We don't need to apply the ThrottlerBehindProxyGuard here since 
  // it's already applied globally in the AppModule
  
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
