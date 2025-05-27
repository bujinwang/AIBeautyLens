import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
// import { CreateTreatmentTypeDto } from './dto/create-treatment-type.dto';
// import { UpdateTreatmentTypeDto } from './dto/update-treatment-type.dto';
// import { TreatmentTypeResponseDto } from './dto/treatment-type-response.dto';
// import { CreateTreatmentRecordDto } from './dto/create-treatment-record.dto';
// import { UpdateTreatmentRecordDto } from './dto/update-treatment-record.dto';
// import { TreatmentRecordResponseDto } from './dto/treatment-record-response.dto';
// import { PageOptionsDto } from '../../common/dto/page-options.dto'; // For pagination
// import { Prisma } from '@prisma/client'; // For types if needed

@Injectable()
export class TreatmentsService {
  private readonly logger = new Logger(TreatmentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --- Treatment Type Service Methods ---
  // async createTreatmentType(dto: CreateTreatmentTypeDto): Promise<TreatmentTypeResponseDto> {
  //   this.logger.log(`Creating new treatment type: ${dto.name}`);
  //   // const treatmentType = await this.prisma.treatmentType.create({ data: dto });
  //   // return treatmentType; // Map to DTO if necessary
  //   return Promise.resolve(null); // Placeholder
  // }

  // async findAllTreatmentTypes(): Promise<TreatmentTypeResponseDto[]> {
  //   this.logger.log('Fetching all active treatment types');
  //   // return this.prisma.treatmentType.findMany({ where: { isActive: true } });
  //   return Promise.resolve([]); // Placeholder
  // }

  // async findOneTreatmentType(id: string): Promise<TreatmentTypeResponseDto> {
  //   this.logger.log(`Fetching treatment type with id: ${id}`);
  //   // const treatmentType = await this.prisma.treatmentType.findUnique({ where: { id } });
  //   // if (!treatmentType) {
  //   //   throw new NotFoundException(`Treatment type with ID "${id}" not found`);
  //   // }
  //   // return treatmentType;
  //   return Promise.resolve(null); // Placeholder
  // }

  // async updateTreatmentType(id: string, dto: UpdateTreatmentTypeDto): Promise<TreatmentTypeResponseDto> {
  //   this.logger.log(`Updating treatment type with id: ${id}`);
  //   // return this.prisma.treatmentType.update({ where: { id }, data: dto });
  //   return Promise.resolve(null); // Placeholder
  // }

  // async removeTreatmentType(id: string): Promise<void> {
  //   this.logger.log(`Deactivating treatment type with id: ${id}`);
  //   // await this.prisma.treatmentType.update({ where: { id }, data: { isActive: false } });
  //   // Consider error handling if type not found or if it has dependent records and isActive is the only way to "delete"
  //   return Promise.resolve(); // Placeholder
  // }

  // --- Treatment Record Service Methods ---
  // async createTreatmentRecord(dto: CreateTreatmentRecordDto, clinicianIdFromAuth: string): Promise<TreatmentRecordResponseDto> {
  //   this.logger.log(`Creating new treatment record for patient ${dto.patientId} by clinician ${clinicianIdFromAuth}`);
  //   // const data = { ...dto, clinicianId: clinicianIdFromAuth };
  //   // const record = await this.prisma.treatmentRecord.create({ data });
  //   // return record; // Map to DTO
  //   return Promise.resolve(null); // Placeholder
  // }

  // async findAllTreatmentRecords(
  //   // pageOptionsDto: PageOptionsDto,
  //   // patientId?: string,
  //   // clinicianId?: string,
  // ): Promise<TreatmentRecordResponseDto[]> { // Paginated<TreatmentRecordResponseDto>
  //   this.logger.log('Fetching all treatment records with filters');
  //   // const where: Prisma.TreatmentRecordWhereInput = {};
  //   // if (patientId) where.patientId = patientId;
  //   // if (clinicianId) where.clinicianId = clinicianId;
  //   // Add date range filters etc.
  //   // const records = await this.prisma.treatmentRecord.findMany({
  //   //   where,
  //   //   // include: { treatmentType: true, patient: true, clinician: true }, // To populate related data
  //   //   // skip: pageOptionsDto.skip,
  //   //   // take: pageOptionsDto.take,
  //   //   // orderBy: { date: 'desc' }, // Example order
  //   // });
  //   // const itemCount = await this.prisma.treatmentRecord.count({ where });
  //   // const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
  //   // return new PageDto(records, pageMetaDto); // Map records to DTOs
  //   return Promise.resolve([]); // Placeholder
  // }

  // async findOneTreatmentRecord(id: string): Promise<TreatmentRecordResponseDto> {
  //   this.logger.log(`Fetching treatment record with id: ${id}`);
  //   // const record = await this.prisma.treatmentRecord.findUnique({
  //   //   where: { id },
  //   //   // include: { treatmentType: true, patient: true, clinician: true },
  //   // });
  //   // if (!record) {
  //   //   throw new NotFoundException(`Treatment record with ID "${id}" not found`);
  //   // }
  //   // return record; // Map to DTO
  //   return Promise.resolve(null); // Placeholder
  // }

  // async updateTreatmentRecord(id: string, dto: UpdateTreatmentRecordDto): Promise<TreatmentRecordResponseDto> {
  //   this.logger.log(`Updating treatment record with id: ${id}`);
  //   // return this.prisma.treatmentRecord.update({
  //   //   where: { id },
  //   //   data: dto,
  //   //   // include: { treatmentType: true, patient: true, clinician: true },
  //   // }); // Map to DTO
  //   return Promise.resolve(null); // Placeholder
  // }

  // async removeTreatmentRecord(id: string): Promise<void> {
  //   this.logger.log(`Deleting treatment record with id: ${id}`);
  //   // await this.prisma.treatmentRecord.delete({ where: { id } });
  //   // Consider soft delete if required by business logic
  //   return Promise.resolve(); // Placeholder
  // }
}