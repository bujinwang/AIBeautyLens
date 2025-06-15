import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Patient, User } from '@prisma/client'; // Import User
import { CreatePatientByClinicianDto } from './dto/create-patient-by-clinician.dto'; // Import DTO
import { FilterPatientDto } from './dto/filter-patient.dto';
import { PageDto } from '../../common/dto/page.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';
import { Order, PageOptionsDto } from '../../common/dto/page-options.dto';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.PatientCreateInput): Promise<Patient> {
    const patient = await this.prisma.patient.create({
      data,
    });
    return patient;
  }

  async createPatientByClinician(
    dto: CreatePatientByClinicianDto,
    clinicianId: string,
  ): Promise<Patient> {
    const patient = await this.prisma.patient.create({
      data: {
        full_name: dto.full_name,
        contact_info: dto.contact_info,
        additional_phi_details: dto.additional_phi_details,
        // No user_id here as this patient is created by a clinician, not self-registered
      },
    });

    // Assign the patient to the clinician who created them
    await this.prisma.clinicianPatientAssignment.create({
      data: {
        clinician_id: clinicianId,
        patient_id: patient.patient_id,
        status: 'active',
      },
    });

    return patient;
  }

  async findAll(filterPatientDto: FilterPatientDto, clinicianId?: string): Promise<PageDto<Patient & { user?: User }>> {
    const pageOptions = filterPatientDto as PageOptionsDto;
    const { fullName, email, organizationId } = filterPatientDto;

    const where: Prisma.PatientWhereInput = {
      is_deleted: false, // Only retrieve non-deleted patients
    };

    if (fullName) {
      where.full_name = { contains: fullName, mode: 'insensitive' };
    }
    if (email) {
      where.user = { email: { contains: email, mode: 'insensitive' } }; // Search by user email
    }
    if (organizationId) {
      where.clinicianAssignments = {
        some: {
          clinician: {
            organization_id: organizationId,
            is_deleted: false, // Ensure clinician is not deleted
          },
        },
      };
    }

    if (clinicianId) {
      where.clinicianAssignments = {
        some: {
          clinician_id: clinicianId,
          is_deleted: false, // Ensure assignment is not deleted
        },
      };
    }

    const orderBy: Prisma.PatientOrderByWithRelationInput = {
      [pageOptions.sortBy || 'created_at']: pageOptions.sortOrder === Order.DESC ? 'desc' : 'asc',
    };

    const [patients, itemCount] = await this.prisma.$transaction([
      this.prisma.patient.findMany({
        where,
        skip: pageOptions.skip,
        take: pageOptions.limit,
        orderBy,
        include: { user: true }, // Include user data
      }),
      this.prisma.patient.count({ where }),
    ]);

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto: pageOptions });

    return new PageDto(patients, pageMetaDto);
  }

  async findOne(id: string, clinicianId?: string): Promise<(Patient & { user?: User }) | null> {
    const whereClause: Prisma.PatientWhereInput = { patient_id: id, is_deleted: false };

    if (clinicianId) {
      whereClause.clinicianAssignments = {
        some: {
          clinician_id: clinicianId,
          is_deleted: false, // Ensure assignment is not deleted
        },
      };
    }

    const patient = await this.prisma.patient.findFirst({
      where: whereClause,
      include: {
        clinicianAssignments: {
          include: { clinician: true }
        },
        user: true, // Include user data
      }
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return patient;
  }

  async update(id: string, data: Prisma.PatientUpdateInput): Promise<Patient> {
    // Implement logic to update a patient by ID using prisma.patient.update
    // console.log('Updating patient with id:', id, 'with data:', data);
    try {
      const patient = await this.prisma.patient.update({
        where: { patient_id: id },
        data,
      });
      return patient;
    } catch (error) {
      // Handle case where patient with id does not exist
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') { // P2025 is the error code for record not found
          throw new NotFoundException(`Patient with ID ${id} not found`);
        }
      }
      throw error; // Re-throw other errors
    }
  }

  async remove(id: string): Promise<Patient> {
    try {
      const softDeletedPatient = await this.prisma.patient.update({
        where: { patient_id: id },
        data: {
          is_deleted: true,
          deleted_at: new Date(),
        },
      });
      return softDeletedPatient;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Patient with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  // Utility to exclude sensitive fields from the User model
  excludeUserPasswordFields<T extends { user?: { hashed_password?: string; salt?: string; verification_token?: string; password_reset_token?: string; refresh_token?: string } }>(
    patient: T
  ): Omit<T, 'user'> & { user?: Omit<NonNullable<T['user']>, 'hashed_password' | 'salt'> } {
    if (!patient.user) {
      return patient as Omit<T, 'user'> & { user?: Omit<NonNullable<T['user']>, 'hashed_password' | 'salt'> };
    }
    const { user, ...rest } = patient;
    const { hashed_password, salt, ...userRest } = user;
    return { ...rest, user: userRest } as Omit<T, 'user'> & { user?: Omit<NonNullable<T['user']>, 'hashed_password' | 'salt'> };
  }
}
