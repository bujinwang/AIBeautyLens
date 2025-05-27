import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Patient } from '@prisma/client';
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

  async findAll(filterPatientDto: FilterPatientDto): Promise<PageDto<Patient>> {
    const pageOptions = filterPatientDto as PageOptionsDto; // Cast to PageOptionsDto to access inherited properties/getters
    const { fullName, email, organizationId } = filterPatientDto;

    const where: Prisma.PatientWhereInput = {};

    if (fullName) {
      where.full_name = { contains: fullName, mode: 'insensitive' };
    }
    if (email) {
      where.contact_info = { contains: email, mode: 'insensitive' };
    }
    if (organizationId) {
      where.clinicianAssignments = {
        some: {
          clinician: {
            organization_id: organizationId,
          },
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
      }),
      this.prisma.patient.count({ where }),
    ]);

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto: pageOptions });

    return new PageDto(patients, pageMetaDto);
  }

  async findOne(id: string) {
    // Implement logic to find a single patient by ID using prisma.patient.findUnique
    // console.log('Finding patient with id:', id);
    const patient = await this.prisma.patient.findUnique({
      where: { patient_id: id },
      include: {
        clinicianAssignments: {
          include: { clinician: true }
        }
      }
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return patient;
  }

  async update(id: string, data: Prisma.PatientUpdateInput) {
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

  async remove(id: string): Promise<Patient | null> {
    // Implement logic to delete a patient by ID using prisma.patient.delete
    // console.log('Removing patient with id:', id);
    try {
      const patient = await this.prisma.patient.delete({
        where: { patient_id: id },
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
}
