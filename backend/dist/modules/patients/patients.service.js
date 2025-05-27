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
exports.PatientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const page_dto_1 = require("../../common/dto/page.dto");
const page_meta_dto_1 = require("../../common/dto/page-meta.dto");
const page_options_dto_1 = require("../../common/dto/page-options.dto");
let PatientsService = class PatientsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const patient = await this.prisma.patient.create({
            data,
        });
        return patient;
    }
    async findAll(filterPatientDto) {
        const pageOptions = filterPatientDto;
        const { fullName, email, organizationId } = filterPatientDto;
        const where = {};
        if (fullName) {
            where.full_name = { contains: fullName, mode: 'insensitive' };
        }
        if (email) {
            where.contact_info = { contains: email, mode: 'insensitive' };
        }
        if (organizationId) {
            where.clinicianAssignments = {
                some: {
                    clinician: {
                        organization_id: organizationId,
                    },
                },
            };
        }
        const orderBy = {
            [pageOptions.sortBy || 'created_at']: pageOptions.sortOrder === page_options_dto_1.Order.DESC ? 'desc' : 'asc',
        };
        const [patients, itemCount] = await this.prisma.$transaction([
            this.prisma.patient.findMany({
                where,
                skip: pageOptions.skip,
                take: pageOptions.limit,
                orderBy,
            }),
            this.prisma.patient.count({ where }),
        ]);
        const pageMetaDto = new page_meta_dto_1.PageMetaDto({ itemCount, pageOptionsDto: pageOptions });
        return new page_dto_1.PageDto(patients, pageMetaDto);
    }
    async findOne(id) {
        const patient = await this.prisma.patient.findUnique({
            where: { patient_id: id },
            include: {
                clinicianAssignments: {
                    include: { clinician: true }
                }
            }
        });
        if (!patient) {
            throw new common_1.NotFoundException(`Patient with ID ${id} not found`);
        }
        return patient;
    }
    async update(id, data) {
        try {
            const patient = await this.prisma.patient.update({
                where: { patient_id: id },
                data,
            });
            return patient;
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new common_1.NotFoundException(`Patient with ID ${id} not found`);
                }
            }
            throw error;
        }
    }
    async remove(id) {
        try {
            const patient = await this.prisma.patient.delete({
                where: { patient_id: id },
            });
            return patient;
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new common_1.NotFoundException(`Patient with ID ${id} not found`);
                }
            }
            throw error;
        }
    }
};
exports.PatientsService = PatientsService;
exports.PatientsService = PatientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PatientsService);
