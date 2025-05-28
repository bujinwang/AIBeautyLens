import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Organization } from '@prisma/client';
import { FilterOrganizationDto } from './dto/filter-organization.dto';
import { PageDto } from '../../common/dto/page.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';
import { Order, PageOptionsDto } from '../../common/dto/page-options.dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.OrganizationCreateInput): Promise<Organization> {
    const organization = await this.prisma.organization.create({
      data,
    });
    return organization;
  }

  async findAll(filterOrganizationDto: FilterOrganizationDto): Promise<PageDto<Organization>> {
    const pageOptions = filterOrganizationDto as PageOptionsDto;
    const { name, address } = filterOrganizationDto;

    const where: Prisma.OrganizationWhereInput = {
      is_deleted: false, // Only retrieve non-deleted organizations
    };

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }
    if (address) {
      where.address = { contains: address, mode: 'insensitive' };
    }

    const orderBy: Prisma.OrganizationOrderByWithRelationInput = {
      [pageOptions.sortBy || 'created_at']: pageOptions.sortOrder === Order.DESC ? 'desc' : 'asc',
    };

    const [organizations, itemCount] = await this.prisma.$transaction([
      this.prisma.organization.findMany({
        where,
        skip: pageOptions.skip,
        take: pageOptions.limit,
        orderBy,
      }),
      this.prisma.organization.count({ where }),
    ]);

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto: pageOptions });

    return new PageDto(organizations, pageMetaDto);
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { organization_id: id, is_deleted: false },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return organization;
  }

  async update(id: string, data: Prisma.OrganizationUpdateInput) {
    // Implement logic to update an organization by ID using prisma.organization.update
    // console.log('Updating organization with id:', id, 'with data:', data);
    try {
      const organization = await this.prisma.organization.update({
        where: { organization_id: id },
        data,
      });
      return organization;
    } catch (error) {
      // Handle case where organization with id does not exist
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') { // P2025 is the error code for record not found
          throw new NotFoundException(`Organization with ID ${id} not found`);
        }
      }
      throw error; // Re-throw other errors
    }
  }

  async remove(id: string): Promise<Organization> {
    try {
      const softDeletedOrganization = await this.prisma.organization.update({
        where: { organization_id: id },
        data: {
          is_deleted: true,
          deleted_at: new Date(),
        },
      });
      return softDeletedOrganization;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Organization with ID ${id} not found`);
        }
      }
      throw error;
    }
  }
}
