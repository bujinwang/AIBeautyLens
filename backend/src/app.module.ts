import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GcsModule } from './modules/gcs/gcs.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule, // Add PrismaModule here
    AuthModule,
    UsersModule,
    GcsModule,
    // AnalysisModule,
    // UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
