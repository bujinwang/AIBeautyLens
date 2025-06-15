"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TreatmentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreatmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let TreatmentsService = TreatmentsService_1 = class TreatmentsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(TreatmentsService_1.name);
        this.toTreatmentTypeResponseDto = (type) => ({
            id: type.id,
            name: type.name,
            description: type.description,
            isActive: type.isActive,
            createdAt: type.createdAt,
            updatedAt: type.updatedAt,
        });
        this.toTreatmentRecordResponseDto = (record) => ({
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
    async createTreatmentType(dto) {
        this.logger.log(`Creating new treatment type: ${dto.name}`);
        try {
            const treatmentType = await this.prisma.treatmentType.create({ data: dto });
            return this.toTreatmentTypeResponseDto(treatmentType);
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new common_1.ConflictException('Treatment type name must be unique.');
            }
            throw error;
        }
    }
    async findAllTreatmentTypes() {
        this.logger.log('Fetching all active treatment types');
        const types = await this.prisma.treatmentType.findMany({ where: { isActive: true, is_deleted: false } });
        return types.map(this.toTreatmentTypeResponseDto);
    }
    async findOneTreatmentType(id) {
        this.logger.log(`Fetching treatment type with id: ${id}`);
        const treatmentType = await this.prisma.treatmentType.findUnique({ where: { id, is_deleted: false } });
        if (!treatmentType) {
            throw new common_1.NotFoundException(`Treatment type with ID "${id}" not found`);
        }
        return this.toTreatmentTypeResponseDto(treatmentType);
    }
    async updateTreatmentType(id, dto) {
        this.logger.log(`Updating treatment type with id: ${id}`);
        try {
            const updated = await this.prisma.treatmentType.update({ where: { id }, data: dto });
            return this.toTreatmentTypeResponseDto(updated);
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new common_1.NotFoundException(`Treatment type with ID "${id}" not found`);
            }
            throw error;
        }
    }
    async removeTreatmentType(id) {
        this.logger.log(`Soft deleting treatment type with id: ${id}`);
        try {
            await this.prisma.treatmentType.update({
                where: { id },
                data: { isActive: false, is_deleted: true, deleted_at: new Date() },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new common_1.NotFoundException(`Treatment type with ID "${id}" not found`);
            }
            throw error;
        }
    }
    async createTreatmentRecord(dto, clinicianId) {
        this.logger.log(`Creating new treatment record for patient ${dto.patientId} by clinician ${clinicianId}`);
        const data = {
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
    async findAllTreatmentRecords(patientId, clinicianId) {
        this.logger.log('Fetching all treatment records with filters');
        const where = {
            is_deleted: false,
        };
        if (patientId)
            where.patientId = patientId;
        if (clinicianId)
            where.clinicianId = clinicianId;
        const records = await this.prisma.treatmentRecord.findMany({
            where: {
                ...where,
                treatmentType: { is_deleted: false }
            },
            include: { treatmentType: true },
            orderBy: { date: 'desc' },
        });
        return records.map(this.toTreatmentRecordResponseDto);
    }
    async findOneTreatmentRecord(id) {
        this.logger.log(`Fetching treatment record with id: ${id}`);
        const record = await this.prisma.treatmentRecord.findUnique({
            where: { id, is_deleted: false, treatmentType: { is_deleted: false } },
            include: { treatmentType: true },
        });
        if (!record) {
            throw new common_1.NotFoundException(`Treatment record with ID "${id}" not found`);
        }
        return this.toTreatmentRecordResponseDto(record);
    }
    async updateTreatmentRecord(id, dto) {
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
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new common_1.NotFoundException(`Treatment record with ID "${id}" not found`);
            }
            throw error;
        }
    }
    async removeTreatmentRecord(id) {
        this.logger.log(`Soft deleting treatment record with id: ${id}`);
        try {
            await this.prisma.treatmentRecord.update({
                where: { id },
                data: { is_deleted: true, deleted_at: new Date() },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new common_1.NotFoundException(`Treatment record with ID "${id}" not found`);
            }
            throw error;
        }
    }
    async isPatientAssignedToClinician(patientId, clinicianId) {
        const assignment = await this.prisma.clinicianPatientAssignment.findFirst({
            where: {
                patient_id: patientId,
                clinician_id: clinicianId,
                is_deleted: false,
            },
        });
        return !!assignment;
    }
};
exports.TreatmentsService = TreatmentsService;
exports.TreatmentsService = TreatmentsService = TreatmentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TreatmentsService);
