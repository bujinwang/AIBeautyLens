import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Query, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TreatmentsService } from './treatments.service';
import { CreateTreatmentTypeDto } from './dto/create-treatment-type.dto';
import { UpdateTreatmentTypeDto } from './dto/update-treatment-type.dto';
import { TreatmentTypeResponseDto } from './dto/treatment-type-response.dto';
import { CreateTreatmentRecordDto } from './dto/create-treatment-record.dto';
import { UpdateTreatmentRecordDto } from './dto/update-treatment-record.dto';
import { TreatmentRecordResponseDto } from './dto/treatment-record-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
// import { PageOptionsDto } from '../../common/dto/page-options.dto'; // For pagination if listing records

@ApiTags('Treatments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard) // Apply to all routes or selectively
@Controller() // Base path can be '/treatments' or split like '/treatment-types' and '/treatment-records'
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  // --- Treatment Types Endpoints ---
  @Post('treatment-types')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Create a new treatment type' })
  @ApiResponse({ status: 201, description: 'Treatment type created successfully.', type: TreatmentTypeResponseDto })
  async createTreatmentType(@Body() createTreatmentTypeDto: CreateTreatmentTypeDto): Promise<TreatmentTypeResponseDto> {
    return this.treatmentsService.createTreatmentType(createTreatmentTypeDto);
  }

  @Get('treatment-types')
  @Roles(Role.Admin, Role.Clinician, Role.Patient)
  @ApiOperation({ summary: 'Get all active treatment types' })
  @ApiResponse({ status: 200, description: 'List of active treatment types.', type: [TreatmentTypeResponseDto] })
  async findAllTreatmentTypes(): Promise<TreatmentTypeResponseDto[]> {
    return this.treatmentsService.findAllTreatmentTypes();
  }

  @Get('treatment-types/:id')
  @Roles(Role.Admin, Role.Clinician, Role.Patient)
  @ApiOperation({ summary: 'Get a specific treatment type by ID' })
  @ApiResponse({ status: 200, description: 'Treatment type details.', type: TreatmentTypeResponseDto })
  async findOneTreatmentType(@Param('id') id: string): Promise<TreatmentTypeResponseDto> {
    return this.treatmentsService.findOneTreatmentType(id);
  }

  @Patch('treatment-types/:id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update a treatment type' })
  @ApiResponse({ status: 200, description: 'Treatment type updated successfully.', type: TreatmentTypeResponseDto })
  async updateTreatmentType(@Param('id') id: string, @Body() updateTreatmentTypeDto: UpdateTreatmentTypeDto): Promise<TreatmentTypeResponseDto> {
    return this.treatmentsService.updateTreatmentType(id, updateTreatmentTypeDto);
  }

  @Delete('treatment-types/:id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Deactivate a treatment type' })
  @ApiResponse({ status: 204, description: 'Treatment type deactivated successfully.' })
  async removeTreatmentType(@Param('id') id: string): Promise<void> {
    return this.treatmentsService.removeTreatmentType(id);
  }

  // --- Treatment Records Endpoints ---
  @Post('treatment-records')
  @Roles(Role.Clinician)
  @ApiOperation({ summary: 'Create a new treatment record' })
  @ApiResponse({ status: 201, description: 'Treatment record created successfully.', type: TreatmentRecordResponseDto })
  async createTreatmentRecord(
    @Body() createTreatmentRecordDto: CreateTreatmentRecordDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TreatmentRecordResponseDto> {
    const clinicianId = user.userId;
    return this.treatmentsService.createTreatmentRecord(createTreatmentRecordDto, clinicianId);
  }

  @Get('treatment-records')
  @Roles(Role.Clinician, Role.Patient, Role.Admin) // Added Admin for broader access if needed
  @ApiOperation({ summary: 'Get treatment records (with optional filters)' })
  @ApiResponse({ status: 200, description: 'List of treatment records.', type: [TreatmentRecordResponseDto] })
  async findAllTreatmentRecords(
    @CurrentUser() user: AuthenticatedUser,
    @Query('patientId') patientIdQuery?: string, // Renamed to avoid conflict
    @Query('clinicianId') clinicianIdQuery?: string, // Renamed to avoid conflict
  ): Promise<TreatmentRecordResponseDto[]> {
    let effectiveClinicianId = clinicianIdQuery;
    let effectivePatientId = patientIdQuery;

    if (user.roles.includes(Role.Clinician) && !user.roles.includes(Role.Admin)) {
      effectiveClinicianId = user.userId;
      if (patientIdQuery && !await this.treatmentsService.isPatientAssignedToClinician(patientIdQuery, user.userId)) {
        throw new ForbiddenException(`Patient with ID "${patientIdQuery}" is not assigned to this clinician.`);
      }
    } else if (user.roles.includes(Role.Patient)) {
      if (!user.patientId) {
        throw new ForbiddenException('Patient ID not found for the authenticated patient.');
      }
      effectivePatientId = user.patientId;
      if (patientIdQuery && patientIdQuery !== user.patientId) {
        throw new ForbiddenException(`Patients can only access their own records. Provided patientId "${patientIdQuery}" does not match authenticated patient ID.`);
      }
    }
    // Admins can query by any patientId or clinicianId

    return this.treatmentsService.findAllTreatmentRecords(effectivePatientId, effectiveClinicianId);
  }

  @Get('treatment-records/:id')
  @Roles(Role.Clinician, Role.Patient, Role.Admin)
  @ApiOperation({ summary: 'Get a specific treatment record by ID' })
  @ApiResponse({ status: 200, description: 'Treatment record details.', type: TreatmentRecordResponseDto })
  async findOneTreatmentRecord(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TreatmentRecordResponseDto> {
    const record = await this.treatmentsService.findOneTreatmentRecord(id);

    if (user.roles.includes(Role.Clinician) && !user.roles.includes(Role.Admin)) {
      if (record.clinicianId !== user.userId) {
        throw new NotFoundException(`Treatment record with ID "${id}" not found for this clinician.`);
      }
    } else if (user.roles.includes(Role.Patient)) {
      if (!user.patientId) {
        throw new ForbiddenException('Patient ID not found for the authenticated patient.');
      }
      if (record.patientId !== user.patientId) {
        throw new NotFoundException(`Treatment record with ID "${id}" not found for this patient.`);
      }
    }
    // Admins can access any record.
    return record;
  }

  @Patch('treatment-records/:id')
  @Roles(Role.Clinician)
  @ApiOperation({ summary: 'Update a treatment record' })
  @ApiResponse({ status: 200, description: 'Treatment record updated successfully.', type: TreatmentRecordResponseDto })
  async updateTreatmentRecord(
    @Param('id') id: string,
    @Body() updateTreatmentRecordDto: UpdateTreatmentRecordDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TreatmentRecordResponseDto> {
    const record = await this.treatmentsService.findOneTreatmentRecord(id); // Fetch to verify ownership

    if (record.clinicianId !== user.userId) {
      throw new NotFoundException(`Treatment record with ID "${id}" not found for this clinician, or you do not have permission to update it.`);
    }
    return this.treatmentsService.updateTreatmentRecord(id, updateTreatmentRecordDto);
  }

  @Delete('treatment-records/:id')
  @Roles(Role.Clinician, Role.Admin)
  @ApiOperation({ summary: 'Delete a treatment record' })
  @ApiResponse({ status: 204, description: 'Treatment record deleted successfully.' })
  async removeTreatmentRecord(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    const record = await this.treatmentsService.findOneTreatmentRecord(id); // Fetch to verify ownership

    if (user.roles.includes(Role.Clinician) && !user.roles.includes(Role.Admin)) {
      if (record.clinicianId !== user.userId) {
        throw new NotFoundException(`Treatment record with ID "${id}" not found for this clinician, or you do not have permission to delete it.`);
      }
    }
    // Admins can delete any record if not restricted by clinician check above.
    // If an Admin should bypass the clinician check, the logic needs adjustment.
    // Current logic: Clinician who is not Admin must own the record. Admin implicitly can delete if they pass the clinician check (if they are also a clinician) or if the check is bypassed for Admins.
    // For safety, let's ensure only the owning clinician or an Admin can delete.
    // The RolesGuard already ensures the user is either Clinician or Admin.
    if (!user.roles.includes(Role.Admin) && record.clinicianId !== user.userId) {
         throw new NotFoundException(`Treatment record with ID "${id}" not found or permission denied.`);
    }

    await this.treatmentsService.removeTreatmentRecord(id);
  }
}
