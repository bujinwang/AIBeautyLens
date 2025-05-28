import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TreatmentsService } from './treatments.service';
import { CreateTreatmentTypeDto } from './dto/create-treatment-type.dto';
import { UpdateTreatmentTypeDto } from './dto/update-treatment-type.dto';
import { TreatmentTypeResponseDto } from './dto/treatment-type-response.dto';
import { CreateTreatmentRecordDto } from './dto/create-treatment-record.dto';
import { UpdateTreatmentRecordDto } from './dto/update-treatment-record.dto';
import { TreatmentRecordResponseDto } from './dto/treatment-record-response.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';
// import { Role } from '../auth/enums/role.enum';
// import { PageOptionsDto } from '../../common/dto/page-options.dto'; // For pagination if listing records

@ApiTags('Treatments')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard, RolesGuard) // Apply to all routes or selectively
@Controller() // Base path can be '/treatments' or split like '/treatment-types' and '/treatment-records'
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  // --- Treatment Types Endpoints ---
  @Post('treatment-types')
  // @Roles(Role.Admin) // Example: Only Admin can create treatment types
  @ApiOperation({ summary: 'Create a new treatment type' })
  @ApiResponse({ status: 201, description: 'Treatment type created successfully.', type: TreatmentTypeResponseDto })
  async createTreatmentType(@Body() createTreatmentTypeDto: CreateTreatmentTypeDto): Promise<TreatmentTypeResponseDto> {
    return this.treatmentsService.createTreatmentType(createTreatmentTypeDto);
  }

  @Get('treatment-types')
  @ApiOperation({ summary: 'Get all active treatment types' })
  @ApiResponse({ status: 200, description: 'List of active treatment types.', type: [TreatmentTypeResponseDto] })
  async findAllTreatmentTypes(): Promise<TreatmentTypeResponseDto[]> {
    return this.treatmentsService.findAllTreatmentTypes();
  }

  @Get('treatment-types/:id')
  @ApiOperation({ summary: 'Get a specific treatment type by ID' })
  @ApiResponse({ status: 200, description: 'Treatment type details.', type: TreatmentTypeResponseDto })
  async findOneTreatmentType(@Param('id') id: string): Promise<TreatmentTypeResponseDto> {
    return this.treatmentsService.findOneTreatmentType(id);
  }

  @Patch('treatment-types/:id')
  // @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update a treatment type' })
  @ApiResponse({ status: 200, description: 'Treatment type updated successfully.', type: TreatmentTypeResponseDto })
  async updateTreatmentType(@Param('id') id: string, @Body() updateTreatmentTypeDto: UpdateTreatmentTypeDto): Promise<TreatmentTypeResponseDto> {
    return this.treatmentsService.updateTreatmentType(id, updateTreatmentTypeDto);
  }

  @Delete('treatment-types/:id')
  // @Roles(Role.Admin)
  @ApiOperation({ summary: 'Deactivate a treatment type' })
  @ApiResponse({ status: 204, description: 'Treatment type deactivated successfully.' })
  async removeTreatmentType(@Param('id') id: string): Promise<void> {
    return this.treatmentsService.removeTreatmentType(id);
  }

  // --- Treatment Records Endpoints ---
  @Post('treatment-records')
  // @Roles(Role.Clinician) // Example: Only Clinicians can create records
  @ApiOperation({ summary: 'Create a new treatment record' })
  @ApiResponse({ status: 201, description: 'Treatment record created successfully.', type: TreatmentRecordResponseDto })
  async createTreatmentRecord(@Body() createTreatmentRecordDto: CreateTreatmentRecordDto, @Req() req: any): Promise<TreatmentRecordResponseDto> {
    // const clinicianId = user.id; // Get from authenticated user
    // For now, assume req.user.clinician_id is available from auth middleware
    const clinicianId = req.user?.clinician_id;
    return this.treatmentsService.createTreatmentRecord(createTreatmentRecordDto, clinicianId);
  }

  @Get('treatment-records')
  // @Roles(Role.Clinician) // Or Patient for their own records
  @ApiOperation({ summary: 'Get treatment records (with optional filters)' })
  @ApiResponse({ status: 200, description: 'List of treatment records.', type: [TreatmentRecordResponseDto] }) // Paginated response later
  async findAllTreatmentRecords(
    @Query('patientId') patientId?: string,
    @Query('clinicianId') clinicianId?: string,
  ): Promise<TreatmentRecordResponseDto[]> {
    return this.treatmentsService.findAllTreatmentRecords(patientId, clinicianId);
  }

  @Get('treatment-records/:id')
  // @Roles(Role.Clinician) // Or Patient if it's their record
  @ApiOperation({ summary: 'Get a specific treatment record by ID' })
  @ApiResponse({ status: 200, description: 'Treatment record details.', type: TreatmentRecordResponseDto })
  async findOneTreatmentRecord(@Param('id') id: string): Promise<TreatmentRecordResponseDto> {
    return this.treatmentsService.findOneTreatmentRecord(id);
  }

  @Patch('treatment-records/:id')
  // @Roles(Role.Clinician)
  @ApiOperation({ summary: 'Update a treatment record' })
  @ApiResponse({ status: 200, description: 'Treatment record updated successfully.', type: TreatmentRecordResponseDto })
  async updateTreatmentRecord(@Param('id') id: string, @Body() updateTreatmentRecordDto: UpdateTreatmentRecordDto): Promise<TreatmentRecordResponseDto> {
    return this.treatmentsService.updateTreatmentRecord(id, updateTreatmentRecordDto);
  }

  @Delete('treatment-records/:id')
  // @Roles(Role.Clinician, Role.Admin) // Example
  @ApiOperation({ summary: 'Delete a treatment record' })
  @ApiResponse({ status: 204, description: 'Treatment record deleted successfully.' })
  async removeTreatmentRecord(@Param('id') id: string): Promise<void> {
    return this.treatmentsService.removeTreatmentRecord(id);
  }
}