import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, ClinicianPatientAssignment } from '@prisma/client';

@Injectable()
export class ClinicianPatientAssignmentsService {
  constructor(private prisma: PrismaService) {}

  // Implement methods for creating, finding assignments, etc.

  async create(data: Prisma.ClinicianPatientAssignmentCreateInput) {
    // Implement assignment creation logic
    try {
      const assignment = await this.prisma.clinicianPatientAssignment.create({
        data,
          include: { // Include related clinician and patient in the response
            clinician: true,
            patient: true,
          },
      });
      return assignment;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2002: Unique constraint failed (e.g., trying to assign the same clinician to the same patient twice)
        if (error.code === 'P2002') {
          throw new ConflictException('Clinician and patient are already assigned.');
        }
        // P2003: Foreign key constraint failed (e.g., clinicianId or patientId does not exist)
        if (error.code === 'P2003') {
             throw new NotFoundException('Clinician or Patient not found.');
           }
      }
      throw error; // Re-throw other errors
    }
  }

  async findAll(clinicianId?: string) {
      const where: Prisma.ClinicianPatientAssignmentWhereInput = {
        is_deleted: false, // Only retrieve non-deleted assignments
      };
      if (clinicianId) {
          where.clinician_id = clinicianId;
      }
      const assignments = await this.prisma.clinicianPatientAssignment.findMany({
          where,
          include: { // Include related clinician and patient
              clinician: true,
              patient: true,
            },
      });
      return assignments;
  }

  async findAssignmentsForClinician(clinicianId: string) {
    const assignments = await this.prisma.clinicianPatientAssignment.findMany({
      where: { clinician_id: clinicianId, is_deleted: false, patient: { is_deleted: false } }, // Filter out soft-deleted patients
      include: { patient: true },
    });
    return assignments;
  }

  async findAssignmentsForPatient(patientId: string) {
     const assignments = await this.prisma.clinicianPatientAssignment.findMany({
       where: { patient_id: patientId, is_deleted: false, clinician: { is_deleted: false } }, // Filter out soft-deleted clinicians
       include: { clinician: true },
     });
     return assignments;
   }

   async findOne(assignmentId: string, clinicianId?: string) {
      const whereClause: Prisma.ClinicianPatientAssignmentWhereInput = {
        assignment_id: assignmentId,
        is_deleted: false,
        clinician: { is_deleted: false }, // Ensure clinician is not deleted
        patient: { is_deleted: false } // Ensure patient is not deleted
      };
      if (clinicianId) {
          whereClause.clinician_id = clinicianId;
      }

      const assignment = await this.prisma.clinicianPatientAssignment.findFirst({
        where: whereClause,
        include: {
            clinician: true,
            patient: true,
          },
      });
      if (!assignment) {
        throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
      }
      return assignment;
    }

    async update(assignmentId: string, data: Prisma.ClinicianPatientAssignmentUpdateInput, clinicianId?: string): Promise<ClinicianPatientAssignment> {
        const whereClause: Prisma.ClinicianPatientAssignmentWhereUniqueInput = { assignment_id: assignmentId };
        if (clinicianId) {
            whereClause.clinician_id = clinicianId;
        }
        try {
          const updatedAssignment = await this.prisma.clinicianPatientAssignment.update({
            where: whereClause,
            data,
            include: { 
                clinician: true,
                patient: true,
              },
          });
          return updatedAssignment;
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') { 
              throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
            }
          }
          throw error;
        }
      }

   async remove(assignmentId: string, clinicianId?: string): Promise<ClinicianPatientAssignment> {
       const whereClause: Prisma.ClinicianPatientAssignmentWhereUniqueInput = { assignment_id: assignmentId };
       if (clinicianId) {
           whereClause.clinician_id = clinicianId;
       }
       try {
           const softDeletedAssignment = await this.prisma.clinicianPatientAssignment.update({
             where: whereClause,
             data: {
               is_deleted: true,
               deleted_at: new Date(),
             },
           });
           return softDeletedAssignment;
         } catch (error) {
             if (error instanceof Prisma.PrismaClientKnownRequestError) {
               if (error.code === 'P2025') {
                 throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
               }
             }
             throw error;
           }
     }
}
