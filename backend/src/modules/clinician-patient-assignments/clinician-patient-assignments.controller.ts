import { Controller, Post, Get, Param, Delete, Body, Patch, ParseUUIDPipe, HttpCode, HttpStatus, UseGuards, Request, ForbiddenException } from '@nestjs/common';
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
  async create(@Body() createAssignmentDto: CreateClinicianPatientAssignmentDto, @Request() req) {
    if (req.user.roles.includes(Role.Clinician) && req.user.userId !== createAssignmentDto.clinician_id) {
      throw new ForbiddenException('Clinicians can only create assignments for themselves.');
    }
    const data: any = { 
        clinician: { connect: { clinician_id: createAssignmentDto.clinician_id } },
        patient: { connect: { patient_id: createAssignmentDto.patient_id } },
        ...(createAssignmentDto.assignment_date && { assignment_date: new Date(createAssignmentDto.assignment_date) }), 
        ...(createAssignmentDto.status && { status: createAssignmentDto.status }),
      };
    return this.assignmentsService.create(data);
  }

  @Get()
  @Roles(Role.Admin, Role.Clinician) // Allow Admin and Clinician to view all assignments (scoped by clinician)
  findAll(@Request() req) {
      const clinicianId = req.user.roles.includes(Role.Admin) ? undefined : req.user.userId;
      return this.assignmentsService.findAll(clinicianId);
  }

  @Get('clinician/:clinicianId')
  @Roles(Role.Admin, Role.Clinician) // Allow Admin and Clinician to view assignments for a clinician
  findForClinician(@Param('clinicianId', ParseUUIDPipe) clinicianId: string, @Request() req) {
    if (req.user.roles.includes(Role.Clinician) && req.user.userId !== clinicianId) {
      throw new ForbiddenException('Clinicians can only view their own assignments.');
    }
    return this.assignmentsService.findAssignmentsForClinician(clinicianId);
  }

  @Get('patient/:patientId')
  @Roles(Role.Admin, Role.Clinician) // Allow Admin and Clinician to view assignments for a patient
  async findForPatient(@Param('patientId', ParseUUIDPipe) patientId: string, @Request() req) {
     if (req.user.roles.includes(Role.Clinician)) {
       const assignments = await this.assignmentsService.findAssignmentsForPatient(patientId);
       const isAssignedToClinician = assignments.some(assignment => assignment.clinician_id === req.user.userId);
       if (!isAssignedToClinician) {
         throw new ForbiddenException('Clinician is not assigned to this patient.');
       }
     }
    return this.assignmentsService.findAssignmentsForPatient(patientId);
  }

  @Get(':assignmentId')
  @Roles(Role.Admin, Role.Clinician) // Allow Admin and Clinician to view a specific assignment
  findOne(@Param('assignmentId', ParseUUIDPipe) assignmentId: string, @Request() req) {
      const clinicianId = req.user.roles.includes(Role.Admin) ? undefined : req.user.userId;
      return this.assignmentsService.findOne(assignmentId, clinicianId);
  }

   @Patch(':assignmentId')
   @HttpCode(HttpStatus.OK) 
   @Roles(Role.Admin, Role.Clinician) // Allow Admin and Clinician to update assignments (scoped by clinician)
   update(@Param('assignmentId', ParseUUIDPipe) assignmentId: string, @Body() updateAssignmentDto: UpdateClinicianPatientAssignmentDto, @Request() req) {
       const clinicianId = req.user.roles.includes(Role.Admin) ? undefined : req.user.userId;
       const data: any = { 
           ...(updateAssignmentDto.assignment_date && { assignment_date: new Date(updateAssignmentDto.assignment_date) }), 
           ...(updateAssignmentDto.status && { status: updateAssignmentDto.status }),
         };
       return this.assignmentsService.update(assignmentId, data, clinicianId);
   }

  @Delete(':assignmentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.Admin, Role.Clinician) // Allow Admin and Clinician to delete assignments (scoped by clinician)
  remove(@Param('assignmentId', ParseUUIDPipe) assignmentId: string, @Request() req) {
      const clinicianId = req.user.roles.includes(Role.Admin) ? undefined : req.user.userId;
      return this.assignmentsService.remove(assignmentId, clinicianId);
  }
}
