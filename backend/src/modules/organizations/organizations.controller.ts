import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, HttpCode, HttpStatus, UseGuards, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { FilterOrganizationDto } from './dto/filter-organization.dto';
import { PageDto } from '../../common/dto/page.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { Organization } from '@prisma/client';

@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.Admin)
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  @Roles(Role.Admin, Role.Clinician)
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(@Query() filterOrganizationDto: FilterOrganizationDto): Promise<PageDto<Organization>> {
    return this.organizationsService.findAll(filterOrganizationDto);
  }

  @Get(':id')
  @Roles(Role.Admin, Role.Clinician)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Admin)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.Admin)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizationsService.remove(id);
  }
}
