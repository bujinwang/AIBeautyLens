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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClinicianPatientAssignmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ClinicianPatientAssignmentsService = class ClinicianPatientAssignmentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        try {
            const assignment = await this.prisma.clinicianPatientAssignment.create({
                data,
                include: {
                    clinician: true,
                    patient: true,
                },
            });
            return assignment;
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new common_1.ConflictException('Clinician and patient are already assigned.');
                }
                if (error.code === 'P2003') {
                    throw new common_1.NotFoundException('Clinician or Patient not found.');
                }
            }
            throw error;
        }
    }
    async findAll() {
        const assignments = await this.prisma.clinicianPatientAssignment.findMany({
            include: {
                clinician: true,
                patient: true,
            },
        });
        return assignments;
    }
    async findAssignmentsForClinician(clinicianId) {
        const assignments = await this.prisma.clinicianPatientAssignment.findMany({
            where: { clinician_id: clinicianId },
            include: { patient: true },
        });
        return assignments;
    }
    async findAssignmentsForPatient(patientId) {
        const assignments = await this.prisma.clinicianPatientAssignment.findMany({
            where: { patient_id: patientId },
            include: { clinician: true },
        });
        return assignments;
    }
    async findOne(assignmentId) {
        const assignment = await this.prisma.clinicianPatientAssignment.findUnique({
            where: { assignment_id: assignmentId },
            include: {
                clinician: true,
                patient: true,
            },
        });
        if (!assignment) {
            throw new common_1.NotFoundException(`Assignment with ID ${assignmentId} not found`);
        }
        return assignment;
    }
    async update(assignmentId, data) {
        try {
            const updatedAssignment = await this.prisma.clinicianPatientAssignment.update({
                where: { assignment_id: assignmentId },
                data,
                include: {
                    clinician: true,
                    patient: true,
                },
            });
            return updatedAssignment;
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new common_1.NotFoundException(`Assignment with ID ${assignmentId} not found`);
                }
            }
            throw error;
        }
    }
    async remove(assignmentId) {
        try {
            const assignment = await this.prisma.clinicianPatientAssignment.delete({
                where: { assignment_id: assignmentId },
            });
            return assignment;
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new common_1.NotFoundException(`Assignment with ID ${assignmentId} not found`);
                }
            }
            throw error;
        }
    }
};
exports.ClinicianPatientAssignmentsService = ClinicianPatientAssignmentsService;
exports.ClinicianPatientAssignmentsService = ClinicianPatientAssignmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClinicianPatientAssignmentsService);
