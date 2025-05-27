import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GcsModule } from './modules/gcs/gcs.module';
import { PrismaModule } from './prisma/prisma.module';
import { LoggingModule } from './common/modules/logging.module';
import { GeminiModule } from './modules/gemini/gemini.module';
import { ImagesModule } from './modules/images/images.module'; // Added ImagesModule
import { TreatmentsModule } from './modules/treatments/treatments.module'; // Added TreatmentsModule
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, Reflector } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 900000, // 15 minutes in ms
        limit: 100,  // 100 requests per 15 minutes per IP
      },
    ]),
    LoggingModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    GcsModule,
    GeminiModule,
    ImagesModule, // Added ImagesModule
    TreatmentsModule, // Added TreatmentsModule
    // AnalysisModule,
    // UploadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Reflector,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
