import { Injectable, NotFoundException, Logger, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTreatmentTypeDto } from './dto/create-treatment-type.dto';
import { UpdateTreatmentTypeDto } from './dto/update-treatment-type.dto';
import { TreatmentTypeResponseDto } from './dto/treatment-type-response.dto';
import { CreateTreatmentRecordDto } from './dto/create-treatment-record.dto';
import { UpdateTreatmentRecordDto } from './dto/update-treatment-record.dto';
import { TreatmentRecordResponseDto } from './dto/treatment-record-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TreatmentsService {
  private readonly logger = new Logger(TreatmentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --- Treatment Type Service Methods ---
  async createTreatmentType(dto: CreateTreatmentTypeDto): Promise<TreatmentTypeResponseDto> {
    this.logger.log(`Creating new treatment type: ${dto.name}`);
    try {
      const treatmentType = await this.prisma.treatmentType.create({ data: dto });
      return this.toTreatmentTypeResponseDto(treatmentType);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Treatment type name must be unique.');
      }
      throw error;
    }
  }

  async findAllTreatmentTypes(): Promise<TreatmentTypeResponseDto[]> {
    this.logger.log('Fetching all active treatment types');
    const types = await this.prisma.treatmentType.findMany({ where: { isActive: true, is_deleted: false } });
    return types.map(this.toTreatmentTypeResponseDto);
  }

  async findOneTreatmentType(id: string): Promise<TreatmentTypeResponseDto> {
    this.logger.log(`Fetching treatment type with id: ${id}`);
    const treatmentType = await this.prisma.treatmentType.findUnique({ where: { id, is_deleted: false } });
    if (!treatmentType) {
      throw new NotFoundException(`Treatment type with ID "${id}" not found`);
    }
    return this.toTreatmentTypeResponseDto(treatmentType);
  }

  async updateTreatmentType(id: string, dto: UpdateTreatmentTypeDto): Promise<TreatmentTypeResponseDto> {
    this.logger.log(`Updating treatment type with id: ${id}`);
    try {
      const updated = await this.prisma.treatmentType.update({ where: { id }, data: dto });
      return this.toTreatmentTypeResponseDto(updated);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Treatment type with ID "${id}" not found`);
      }
      throw error;
    }
  }

  async removeTreatmentType(id: string): Promise<void> {
    this.logger.log(`Soft deleting treatment type with id: ${id}`);
    try {
      await this.prisma.treatmentType.update({
        where: { id },
        data: { isActive: false, is_deleted: true, deleted_at: new Date() },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Treatment type with ID "${id}" not found`);
      }
      throw error;
    }
  }

  private toTreatmentTypeResponseDto = (type: any): TreatmentTypeResponseDto => ({
    id: type.id,
    name: type.name,
    description: type.description,
    isActive: type.isActive,
    createdAt: type.createdAt,
    updatedAt: type.updatedAt,
  });

  // --- Treatment Record Service Methods ---
  async createTreatmentRecord(dto: CreateTreatmentRecordDto, clinicianId: string): Promise<TreatmentRecordResponseDto> {
    this.logger.log(`Creating new treatment record for patient ${dto.patientId} by clinician ${clinicianId}`);
    const data: Prisma.TreatmentRecordCreateInput = {
      date: new Date(dto.date),
      notes: dto.notes,
      totalPrice: dto.totalPrice,
      currency: dto.currency,
      patient: { connect: { patient_id: dto.patientId } },
      clinician: { connect: { clinician_id: clinicianId } },
      treatmentType: { connect: { id: dto.treatmentTypeId } },
      firestoreAnalysisRecordId: dto.firestoreAnalysisRecordId,
    };
    const record = await this.prisma.treatmentRecord.create({
      data,
      include: { treatmentType: true },
    });
    return this.toTreatmentRecordResponseDto(record);
  }

  async findAllTreatmentRecords(
    patientId?: string,
    clinicianId?: string,
  ): Promise<TreatmentRecordResponseDto[]> {
    this.logger.log('Fetching all treatment records with filters');
    const where: Prisma.TreatmentRecordWhereInput = {
      is_deleted: false, // Only retrieve non-deleted records
    };
    if (patientId) where.patientId = patientId;
    if (clinicianId) where.clinicianId = clinicianId;
    const records = await this.prisma.treatmentRecord.findMany({
      where,
      include: { treatmentType: { where: { is_deleted: false } } }, // Ensure treatment type is not deleted
      orderBy: { date: 'desc' },
    });
    return records.map(this.toTreatmentRecordResponseDto);
  }

  async findOneTreatmentRecord(id: string): Promise<TreatmentRecordResponseDto> {
    this.logger.log(`Fetching treatment record with id: ${id}`);
    const record = await this.prisma.treatmentRecord.findUnique({
      where: { id, is_deleted: false },
      include: { treatmentType: { where: { is_deleted: false } } },
    });
    if (!record) {
      throw new NotFoundException(`Treatment record with ID "${id}" not found`);
    }
    return this.toTreatmentRecordResponseDto(record);
  }

  async updateTreatmentRecord(id: string, dto: UpdateTreatmentRecordDto): Promise<TreatmentRecordResponseDto> {
    this.logger.log(`Updating treatment record with id: ${id}`);
    try {
      const updated = await this.prisma.treatmentRecord.update({
        where: { id },
        data: {
          ...dto,
          date: dto.date ? new Date(dto.date) : undefined,
        },
        include: { treatmentType: true },
      });
      return this.toTreatmentRecordResponseDto(updated);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Treatment record with ID "${id}" not found`);
      }
      throw error;
    }
  }

  async removeTreatmentRecord(id: string): Promise<void> {
    this.logger.log(`Soft deleting treatment record with id: ${id}`);
    try {
      await this.prisma.treatmentRecord.update({
        where: { id },
        data: { is_deleted: true, deleted_at: new Date() },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Treatment record with ID "${id}" not found`);
      }
      throw error;
    }
  }

  async isPatientAssignedToClinician(patientId: string, clinicianId: string): Promise<boolean> {
    const assignment = await this.prisma.clinicianPatientAssignment.findFirst({
      where: {
        patient_id: patientId,
        clinician_id: clinicianId,
        is_deleted: false, // Ensure assignment is not deleted
      },
    });
    return !!assignment;
  }

  private toTreatmentRecordResponseDto = (record: any): TreatmentRecordResponseDto => ({
    id: record.id,
    date: record.date,
    notes: record.notes,
    totalPrice: Number(record.totalPrice),
    currency: record.currency,
    patientId: record.patientId,
    clinicianId: record.clinicianId,
    treatmentTypeId: record.treatmentTypeId,
    treatmentType: record.treatmentType ? this.toTreatmentTypeResponseDto(record.treatmentType) : undefined,
    firestoreAnalysisRecordId: record.firestoreAnalysisRecordId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}
