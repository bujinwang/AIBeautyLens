import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, HttpCode, HttpStatus, UseGuards, Query, UsePipes, ValidationPipe, Request } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { FilterPatientDto } from './dto/filter-patient.dto';
import { PageDto } from '../../common/dto/page.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { Patient } from '@prisma/client';

@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard) // Apply JWT and Roles guards to all routes in this controller
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED) // Return 201 Created on successful creation
  @Roles(Role.Admin, Role.Clinician) // Allow Admin and Clinician to create patients
  create(@Body() createPatientDto: CreatePatientDto) {
    // The DTO validation will ensure the body has the correct structure
    return this.patientsService.create(createPatientDto);
  }

  @Get()
  @Roles(Role.Admin, Role.Clinician) // Allow Admin and Clinician to view all patients (consider scope later)
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(@Query() filterPatientDto: FilterPatientDto, @Request() req): Promise<PageDto<Patient>> {
    const clinicianId = req.user.roles.includes(Role.Admin) ? undefined : req.user.userId;
    return this.patientsService.findAll(filterPatientDto, clinicianId);
  }

  @Get(':id')
  @Roles(Role.Admin, Role.Clinician) // Allow Admin and Clinician to view a specific patient (consider scope later)
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) { // Use ParseUUIDPipe for UUID IDs
    const clinicianId = req.user.roles.includes(Role.Admin) ? undefined : req.user.userId;
    return this.patientsService.findOne(id, clinicianId);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.Clinician) // Allow Admin and Clinician to update patients (consider scope later)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updatePatientDto: UpdatePatientDto) {
    // The DTO validation will ensure the body has the correct structure
    return this.patientsService.update(id, updatePatientDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Return 204 No Content on successful deletion
  @Roles(Role.Admin) // Only allow Admin to delete patients
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.patientsService.remove(id);
  }
}
