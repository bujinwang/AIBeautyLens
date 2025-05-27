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
exports.CliniciansService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const role_enum_1 = require("../auth/enums/role.enum");
let CliniciansService = class CliniciansService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const newClinician = await this.prisma.clinician.create({
            data: {
                ...data,
                roles: data.roles || [role_enum_1.Role.Clinician],
            }
        });
        return newClinician;
    }
    async findOneByEmail(email) {
        return this.prisma.clinician.findUnique({
            where: { email },
        });
    }
    async findOneById(id) {
        return this.prisma.clinician.findUnique({
            where: { clinician_id: id },
        });
    }
    async findOneByVerificationToken(token) {
        return this.prisma.clinician.findUnique({
            where: { verification_token: token },
        });
    }
    async findOneByResetToken(token) {
        return this.prisma.clinician.findUnique({
            where: { password_reset_token: token },
        });
    }
    async findOneByRefreshToken(token) {
        return this.prisma.clinician.findUnique({
            where: { refresh_token: token },
        });
    }
    async findOne(id) {
        const clinician = await this.prisma.clinician.findUnique({
            where: { clinician_id: id },
            include: {
                patientAssignments: {
                    include: { patient: true }
                }
            }
        });
        if (!clinician) {
            throw new common_1.NotFoundException(`Clinician with ID ${id} not found`);
        }
        return this.excludePasswordFields(clinician);
    }
    async findAll() {
        const clinicians = await this.prisma.clinician.findMany({});
        return clinicians.map(clinician => this.excludePasswordFields(clinician));
    }
    async update(id, data) {
        try {
            const updatedClinician = await this.prisma.clinician.update({
                where: { clinician_id: id },
                data,
            });
            return this.excludePasswordFields(updatedClinician);
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new common_1.NotFoundException(`Clinician with ID ${id} not found`);
                }
            }
            throw error;
        }
    }
    async remove(id) {
        try {
            const deletedClinician = await this.prisma.clinician.delete({
                where: { clinician_id: id },
            });
            return this.excludePasswordFields(deletedClinician);
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new common_1.NotFoundException(`Clinician with ID ${id} not found`);
                }
            }
            throw error;
        }
    }
    excludePasswordFields(clinician) {
        const { hashed_password, salt, ...result } = clinician;
        return result;
    }
};
exports.CliniciansService = CliniciansService;
exports.CliniciansService = CliniciansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CliniciansService);
