import { Controller, Post, Get, Param, Delete, Body, Patch, ParseUUIDPipe, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ClinicianPatientAssignmentsService } from './clinician-patient-assignments.service';
import { CreateClinicianPatientAssignmentDto } from './dto/create-clinician-patient-assignment.dto';
import { UpdateClinicianPatientAssignmentDto } from './dto/update-clinician-patient-assignment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('clinician-patient-assignments')
@UseGuards(JwtAuthGuard, RolesGuard) // Apply JWT and Roles guards
export class ClinicianPatientAssignmentsController {
  constructor(private readonly assignmentsService: ClinicianPatientAssignmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.Admin, Role.Clinician) // Allow Admin and Clinician to create assignments
  create(@Body() createAssignmentDto: CreateClinicianPatientAssignmentDto) {
    // Map DTO to Prisma CreateInput format
    const data: any = { 
        clinician: { connect: { clinician_id: createAssignmentDto.clinician_id } },
        patient: { connect: { patient_id: createAssignmentDto.patient_id } },
        ...(createAssignmentDto.assignment_date && { assignment_date: new Date(createAssignmentDto.assignment_date) }), 
        ...(createAssignmentDto.status && { status: createAssignmentDto.status }),
      };
    return this.assignmentsService.create(data);
  }

  @Get()
  @Roles(Role.Admin) // Only Admin can view all assignments
  findAll() {
      return this.assignmentsService.findAll();
  }

  @Get('clinician/:clinicianId')
  @Roles(Role.Admin, Role.Clinician) // Allow Admin and Clinician to view assignments for a clinician
  findForClinician(@Param('clinicianId', ParseUUIDPipe) clinicianId: string) {
    // TODO: Implement logic to ensure the requesting clinician is authorized to view these assignments
    return this.assignmentsService.findAssignmentsForClinician(clinicianId);
  }

  @Get('patient/:patientId')
  @Roles(Role.Admin, Role.Clinician) // Allow Admin and Clinician to view assignments for a patient
  findForPatient(@Param('patientId', ParseUUIDPipe) patientId: string) {
     // TODO: Implement logic to ensure the requesting clinician is authorized to view these assignments
    return this.assignmentsService.findAssignmentsForPatient(patientId);
  }

  @Get(':assignmentId')
  @Roles(Role.Admin, Role.Clinician) // Allow Admin and Clinician to view a specific assignment
  findOne(@Param('assignmentId', ParseUUIDPipe) assignmentId: string) {
      // TODO: Implement logic to ensure the requesting clinician is authorized to view this assignment
      return this.assignmentsService.findOne(assignmentId);
  }

   @Patch(':assignmentId')
   @HttpCode(HttpStatus.OK) 
   @Roles(Role.Admin) // Only Admin can update assignments (refine scope later)
   update(@Param('assignmentId', ParseUUIDPipe) assignmentId: string, @Body() updateAssignmentDto: UpdateClinicianPatientAssignmentDto) {
       // Map DTO to Prisma UpdateInput format
       const data: any = { 
           ...(updateAssignmentDto.assignment_date && { assignment_date: new Date(updateAssignmentDto.assignment_date) }), 
           ...(updateAssignmentDto.status && { status: updateAssignmentDto.status }),
         };
       // TODO: Implement logic to ensure the requesting clinician is authorized to update this assignment
       return this.assignmentsService.update(assignmentId, data);
   }

  @Delete(':assignmentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.Admin) // Only Admin can delete assignments
  remove(@Param('assignmentId', ParseUUIDPipe) assignmentId: string) {
      return this.assignmentsService.remove(assignmentId);
  }
} 