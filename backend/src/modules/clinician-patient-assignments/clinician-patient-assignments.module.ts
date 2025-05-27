import { Module } from '@nestjs/common';
import { ClinicianPatientAssignmentsService } from './clinician-patient-assignments.service';
import { ClinicianPatientAssignmentsController } from './clinician-patient-assignments.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ClinicianPatientAssignmentsController],
  providers: [ClinicianPatientAssignmentsService, PrismaService],
  exports: [ClinicianPatientAssignmentsService], // Export if needed by other modules
})
export class ClinicianPatientAssignmentsModule {} 