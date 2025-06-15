import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Clinician, User } from '@prisma/client'; // Import User
import { FilterClinicianDto } from './dto/filter-clinician.dto';
import { PageDto } from '../../common/dto/page.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';
import { Order, PageOptionsDto } from '../../common/dto/page-options.dto';

@Injectable()
export class CliniciansService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ClinicianCreateInput): Promise<Clinician> {
    const clinician = await this.prisma.clinician.create({
      data,
    });
    return clinician;
  }

  async findAll(filterClinicianDto: FilterClinicianDto): Promise<PageDto<Clinician & { user: User }>> {
    const pageOptions = filterClinicianDto as PageOptionsDto;
    const { name, email, specialty, organizationId } = filterClinicianDto;

    const where: Prisma.ClinicianWhereInput = {
      is_deleted: false, // Only retrieve non-deleted clinicians
    };

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }
    if (email) {
      where.user = { email: { contains: email, mode: 'insensitive' } }; // Search by user email
    }
    if (specialty) {
      where.specialty = { contains: specialty, mode: 'insensitive' };
    }
    if (organizationId) {
      where.organization_id = organizationId;
    }

    const orderBy: Prisma.ClinicianOrderByWithRelationInput = {
      [pageOptions.sortBy || 'created_at']: pageOptions.sortOrder === Order.DESC ? 'desc' : 'asc',
    };

    const [clinicians, itemCount] = await this.prisma.$transaction([
      this.prisma.clinician.findMany({
        where,
        skip: pageOptions.skip,
        take: pageOptions.limit,
        orderBy,
        include: { user: true }, // Include user data
      }),
      this.prisma.clinician.count({ where }),
    ]);

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto: pageOptions });

    return new PageDto(clinicians, pageMetaDto);
  }

  async findOne(id: string): Promise<(Clinician & { user: User }) | null> {
    const clinician = await this.prisma.clinician.findUnique({
      where: { clinician_id: id, is_deleted: false },
      include: { user: true }, // Include user data
    });
    if (!clinician) {
      throw new NotFoundException(`Clinician with ID ${id} not found`);
    }
    return clinician;
  }

  async findOneByEmail(email: string): Promise<(Clinician & { user: User }) | null> {
    return this.prisma.clinician.findFirst({
      where: {
        user: { email, is_deleted: false }, // Search by user email
        is_deleted: false,
      },
      include: { user: true }, // Include user data
    });
  }

  async findOneByVerificationToken(token: string): Promise<(Clinician & { user: User }) | null> {
    return this.prisma.clinician.findFirst({
      where: {
        user: { verification_token: token, is_deleted: false },
        is_deleted: false,
      },
      include: { user: true },
    });
  }

  async findOneByResetToken(token: string): Promise<(Clinician & { user: User }) | null> {
    return this.prisma.clinician.findFirst({
      where: {
        user: { password_reset_token: token, is_deleted: false },
        is_deleted: false,
      },
      include: { user: true },
    });
  }

  async findOneByRefreshToken(token: string): Promise<(Clinician & { user: User }) | null> {
    return this.prisma.clinician.findFirst({
      where: {
        user: { refresh_token: token, is_deleted: false },
        is_deleted: false,
      },
      include: { user: true },
    });
  }

  async update(id: string, data: Prisma.ClinicianUpdateInput): Promise<Clinician> {
    try {
      const clinician = await this.prisma.clinician.update({
        where: { clinician_id: id },
        data,
      });
      return clinician;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Clinician with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Clinician> {
    try {
      const softDeletedClinician = await this.prisma.clinician.update({
        where: { clinician_id: id },
        data: {
          is_deleted: true,
          deleted_at: new Date(),
        },
      });
      return softDeletedClinician;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Clinician with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  // Utility to exclude sensitive fields from the User model
  excludeUserPasswordFields<T extends { user: { hashed_password?: string; salt?: string; verification_token?: string; password_reset_token?: string; refresh_token?: string } }>(
    clinician: T
  ): Omit<T, 'user'> & { user: Omit<T['user'], 'hashed_password' | 'salt'> } {
    const { user, ...rest } = clinician;
    const { hashed_password, salt, ...userRest } = user;
    return { ...rest, user: userRest } as Omit<T, 'user'> & { user: Omit<T['user'], 'hashed_password' | 'salt'> };
  }
}
