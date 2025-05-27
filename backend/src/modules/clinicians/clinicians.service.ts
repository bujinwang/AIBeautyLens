import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Clinician } from '@prisma/client'; // Import Clinician type
import * as bcrypt from 'bcrypt';
import { Role } from '../auth/enums/role.enum';

@Injectable()
export class CliniciansService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ClinicianCreateInput): Promise<Clinician> {
    // TODO: Implement clinician creation logic using prisma.clinician.create
    const newClinician = await this.prisma.clinician.create({
        data: { 
            ...data,
            roles: data.roles || [Role.Clinician], // Default role if not provided
         }
    });
      return newClinician;
  }

  async findOneByEmail(email: string): Promise<Clinician | null> {
     // TODO: Implement finding clinician by email
     return this.prisma.clinician.findUnique({
         where: { email },
     });
  }

  async findOneById(id: string): Promise<Clinician | null> {
      // TODO: Implement finding clinician by ID
      return this.prisma.clinician.findUnique({
          where: { clinician_id: id },
      });
   }

  async findOneByVerificationToken(token: string): Promise<Clinician | null> {
      return this.prisma.clinician.findUnique({
          where: { verification_token: token },
      });
  }

  async findOneByResetToken(token: string): Promise<Clinician | null> {
      return this.prisma.clinician.findUnique({
          where: { password_reset_token: token },
      });
  }

  async findOneByRefreshToken(token: string): Promise<Clinician | null> {
      return this.prisma.clinician.findUnique({
          where: { refresh_token: token },
      });
  }

  async findOne(id: string): Promise<Omit<Clinician, 'hashed_password' | 'salt'> | null> {
    // TODO: Implement logic to find a single clinician by ID using prisma.clinician.findUnique
    const clinician = await this.prisma.clinician.findUnique({
      where: { clinician_id: id },
      include: { // Include related patient assignments
          patientAssignments: {
              include: { patient: true } // Include patient details in assignments
          }
      }
    });

    if (!clinician) {
      throw new NotFoundException(`Clinician with ID ${id} not found`);
    }

    return this.excludePasswordFields(clinician);
  }

  async findAll(): Promise<Omit<Clinician, 'hashed_password' | 'salt'>[]> {
      // TODO: Implement logic to find all clinicians using prisma.clinician.findMany
       const clinicians = await this.prisma.clinician.findMany({ }); // Consider including assignments here if needed
       return clinicians.map(clinician => this.excludePasswordFields(clinician));
  }

  async update(id: string, data: Prisma.ClinicianUpdateInput): Promise<Omit<Clinician, 'hashed_password' | 'salt'>> {
    // TODO: Implement logic to update a clinician by ID using prisma.clinician.update
    try {
      const updatedClinician = await this.prisma.clinician.update({
        where: { clinician_id: id },
        data,
      });
      return this.excludePasswordFields(updatedClinician);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') { 
          throw new NotFoundException(`Clinician with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Omit<Clinician, 'hashed_password' | 'salt'> | null> {
    // TODO: Implement logic to delete a clinician by ID using prisma.clinician.delete
    try {
        const deletedClinician = await this.prisma.clinician.delete({
        where: { clinician_id: id },
      });
        return this.excludePasswordFields(deletedClinician);
    } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') { 
              throw new NotFoundException(`Clinician with ID ${id} not found`);
            }
      }
          throw error;
    }
  }

  // Helper function to exclude hashed_password and salt from results
  excludePasswordFields(clinician: Clinician): Omit<Clinician, 'hashed_password' | 'salt'> {
    const { hashed_password, salt, ...result } = clinician;
    return result;
  }

}