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
let CliniciansService = class CliniciansService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.clinician.create({
            data,
        });
    }
    async findAll() {
        return this.prisma.clinician.findMany();
    }
    async findOneById(id) {
        const clinician = await this.prisma.clinician.findUnique({
            where: { clinician_id: id },
        });
        if (!clinician) {
            return null;
        }
        return clinician;
    }
    async findOneByEmail(email) {
        const clinician = await this.prisma.clinician.findUnique({
            where: { email },
        });
        return clinician;
    }
    async update(id, data) {
        try {
            return await this.prisma.clinician.update({
                where: { clinician_id: id },
                data,
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new common_1.NotFoundException(`Clinician with ID "${id}" not found`);
            }
            throw error;
        }
    }
    async remove(id) {
        try {
            return await this.prisma.clinician.delete({
                where: { clinician_id: id },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new common_1.NotFoundException(`Clinician with ID "${id}" not found`);
            }
            throw error;
        }
    }
    excludePasswordFields(clinician) {
        if (!clinician)
            return null;
        const { hashed_password, salt, ...result } = clinician;
        return result;
    }
};
exports.CliniciansService = CliniciansService;
exports.CliniciansService = CliniciansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CliniciansService);
