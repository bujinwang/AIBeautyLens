import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { LoggingModule } from './common/modules/logging.module';
import { GeminiModule } from './modules/gemini/gemini.module';
import { ImagesModule } from './modules/images/images.module';
import { TreatmentsModule } from './modules/treatments/treatments.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { PatientsModule } from './modules/patients/patients.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ClinicianPatientAssignmentsModule } from './modules/clinician-patient-assignments/clinician-patient-assignments.module';
import { CliniciansModule } from './modules/clinicians/clinicians.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 10,  // 10 requests per minute per IP
      },
    ]),
    LoggingModule,
    PrismaModule,
    AuthModule,
    CliniciansModule,
    PatientsModule,
    OrganizationsModule,
    ClinicianPatientAssignmentsModule,
    TreatmentsModule,
    ImagesModule,
    GeminiModule,
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
