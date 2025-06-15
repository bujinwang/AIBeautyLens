import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe, UsePipes, ValidationPipe, Request, Query } from '@nestjs/common'; // Added Query
import { CliniciansService } from './clinicians.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { Prisma } from '@prisma/client';
import { FilterClinicianDto } from './dto/filter-clinician.dto'; // Import FilterClinicianDto

@Controller('clinicians')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CliniciansController {
  constructor(private readonly cliniciansService: CliniciansService) {}

  @Post()
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createClinicianDto: Prisma.ClinicianCreateInput) {
    return this.cliniciansService.create(createClinicianDto);
  }

  @Get()
  @Roles(Role.Admin)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })) // Added UsePipes and ValidationPipe
  findAll(@Query() filterClinicianDto: FilterClinicianDto) { // Added @Query() filterClinicianDto
    return this.cliniciansService.findAll(filterClinicianDto); // Pass filterClinicianDto
  }

  @Get('me')
  @Roles(Role.Admin, Role.Clinician)
  async getMe(@Request() req) {
    // req.user should have clinician_id
    return this.cliniciansService.findOne(req.user.userId);
  }

  @Get(':id')
  @Roles(Role.Admin)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.cliniciansService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Admin)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateClinicianDto: Prisma.ClinicianUpdateInput) {
    return this.cliniciansService.update(id, updateClinicianDto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.cliniciansService.remove(id);
  }
} 