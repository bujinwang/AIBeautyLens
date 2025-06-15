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
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { PatientsModule } from './modules/patients/patients.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ClinicianPatientAssignmentsModule } from './modules/clinician-patient-assignments/clinician-patient-assignments.module';
import { CliniciansModule } from './modules/clinicians/clinicians.module';
// import { ThrottlerBehindProxyGuard } from './common/guards/throttler-behind-proxy.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{
      ttl: 60,
      limit: 10,
    }]),
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
    // Temporarily disable throttling to get the app working
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerBehindProxyGuard,
    // },
  ],
})
export class AppModule {}
