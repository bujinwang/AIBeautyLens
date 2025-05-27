import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Clinician, Prisma } from '@prisma/client'; // Prisma will generate these types

@Injectable()
export class CliniciansService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ClinicianCreateInput): Promise<Clinician> {
    return this.prisma.clinician.create({
      data,
    });
  }

  async findAll(): Promise<Clinician[]> {
    return this.prisma.clinician.findMany();
  }

  async findOneById(id: string): Promise<Clinician | null> {
    const clinician = await this.prisma.clinician.findUnique({
      where: { clinician_id: id },
    });
    if (!clinician) {
      // Optional: throw new NotFoundException(`Clinician with ID "${id}" not found`);
      return null;
    }
    return clinician;
  }

  async findOneByEmail(email: string): Promise<Clinician | null> {
    const clinician = await this.prisma.clinician.findUnique({
      where: { email },
    });
    // Optional: if (!clinician) { throw new NotFoundException(`Clinician with email "${email}" not found`); }
    return clinician;
  }

  async update(id: string, data: Prisma.ClinicianUpdateInput): Promise<Clinician | null> {
    try {
      return await this.prisma.clinician.update({
        where: { clinician_id: id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        // P2025: Record to update not found
        throw new NotFoundException(`Clinician with ID "${id}" not found`);
      }
      throw error; // Re-throw other errors
    }
  }

  async remove(id: string): Promise<Clinician | null> {
    try {
      return await this.prisma.clinician.delete({
        where: { clinician_id: id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        // P2025: Record to delete not found
        throw new NotFoundException(`Clinician with ID "${id}" not found`);
      }
      throw error; // Re-throw other errors
    }
  }

  // Helper to exclude password fields when returning clinician data
  excludePasswordFields(clinician: Clinician): Omit<Clinician, 'hashed_password' | 'salt'> {
    if (!clinician) return null;
    const { hashed_password, salt, ...result } = clinician;
    return result;
  }
}