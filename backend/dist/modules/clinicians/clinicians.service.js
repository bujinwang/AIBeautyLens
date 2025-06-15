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
const page_dto_1 = require("../../common/dto/page.dto");
const page_meta_dto_1 = require("../../common/dto/page-meta.dto");
const page_options_dto_1 = require("../../common/dto/page-options.dto");
let CliniciansService = class CliniciansService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const clinician = await this.prisma.clinician.create({
            data,
        });
        return clinician;
    }
    async findAll(filterClinicianDto) {
        const pageOptions = filterClinicianDto;
        const { name, email, specialty, organizationId } = filterClinicianDto;
        const where = {
            is_deleted: false,
        };
        if (name) {
            where.name = { contains: name, mode: 'insensitive' };
        }
        if (email) {
            where.user = { email: { contains: email, mode: 'insensitive' } };
        }
        if (specialty) {
            where.specialty = { contains: specialty, mode: 'insensitive' };
        }
        if (organizationId) {
            where.organization_id = organizationId;
        }
        const orderBy = {
            [pageOptions.sortBy || 'created_at']: pageOptions.sortOrder === page_options_dto_1.Order.DESC ? 'desc' : 'asc',
        };
        const [clinicians, itemCount] = await this.prisma.$transaction([
            this.prisma.clinician.findMany({
                where,
                skip: pageOptions.skip,
                take: pageOptions.limit,
                orderBy,
                include: { user: true },
            }),
            this.prisma.clinician.count({ where }),
        ]);
        const pageMetaDto = new page_meta_dto_1.PageMetaDto({ itemCount, pageOptionsDto: pageOptions });
        return new page_dto_1.PageDto(clinicians, pageMetaDto);
    }
    async findOne(id) {
        const clinician = await this.prisma.clinician.findUnique({
            where: { clinician_id: id, is_deleted: false },
            include: { user: true },
        });
        if (!clinician) {
            throw new common_1.NotFoundException(`Clinician with ID ${id} not found`);
        }
        return clinician;
    }
    async findOneByEmail(email) {
        return this.prisma.clinician.findFirst({
            where: {
                user: { email, is_deleted: false },
                is_deleted: false,
            },
            include: { user: true },
        });
    }
    async findOneByVerificationToken(token) {
        return this.prisma.clinician.findFirst({
            where: {
                user: { verification_token: token, is_deleted: false },
                is_deleted: false,
            },
            include: { user: true },
        });
    }
    async findOneByResetToken(token) {
        return this.prisma.clinician.findFirst({
            where: {
                user: { password_reset_token: token, is_deleted: false },
                is_deleted: false,
            },
            include: { user: true },
        });
    }
    async findOneByRefreshToken(token) {
        return this.prisma.clinician.findFirst({
            where: {
                user: { refresh_token: token, is_deleted: false },
                is_deleted: false,
            },
            include: { user: true },
        });
    }
    async update(id, data) {
        try {
            const clinician = await this.prisma.clinician.update({
                where: { clinician_id: id },
                data,
            });
            return clinician;
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
            const softDeletedClinician = await this.prisma.clinician.update({
                where: { clinician_id: id },
                data: {
                    is_deleted: true,
                    deleted_at: new Date(),
                },
            });
            return softDeletedClinician;
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
    excludeUserPasswordFields(clinician) {
        const { user, ...rest } = clinician;
        const { hashed_password, salt, ...userRest } = user;
        return { ...rest, user: userRest };
    }
};
exports.CliniciansService = CliniciansService;
exports.CliniciansService = CliniciansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CliniciansService);
