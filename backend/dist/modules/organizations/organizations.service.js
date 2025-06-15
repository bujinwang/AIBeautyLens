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
exports.OrganizationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const page_dto_1 = require("../../common/dto/page.dto");
const page_meta_dto_1 = require("../../common/dto/page-meta.dto");
const page_options_dto_1 = require("../../common/dto/page-options.dto");
let OrganizationsService = class OrganizationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const organization = await this.prisma.organization.create({
            data,
        });
        return organization;
    }
    async findAll(filterOrganizationDto) {
        const pageOptions = filterOrganizationDto;
        const { name, address } = filterOrganizationDto;
        const where = {
            is_deleted: false,
        };
        if (name) {
            where.name = { contains: name, mode: 'insensitive' };
        }
        if (address) {
            where.address = { contains: address, mode: 'insensitive' };
        }
        const orderBy = {
            [pageOptions.sortBy || 'created_at']: pageOptions.sortOrder === page_options_dto_1.Order.DESC ? 'desc' : 'asc',
        };
        const [organizations, itemCount] = await this.prisma.$transaction([
            this.prisma.organization.findMany({
                where,
                skip: pageOptions.skip,
                take: pageOptions.limit,
                orderBy,
            }),
            this.prisma.organization.count({ where }),
        ]);
        const pageMetaDto = new page_meta_dto_1.PageMetaDto({ itemCount, pageOptionsDto: pageOptions });
        return new page_dto_1.PageDto(organizations, pageMetaDto);
    }
    async findOne(id) {
        const organization = await this.prisma.organization.findUnique({
            where: { organization_id: id, is_deleted: false },
        });
        if (!organization) {
            throw new common_1.NotFoundException(`Organization with ID ${id} not found`);
        }
        return organization;
    }
    async update(id, data) {
        try {
            const organization = await this.prisma.organization.update({
                where: { organization_id: id },
                data,
            });
            return organization;
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new common_1.NotFoundException(`Organization with ID ${id} not found`);
                }
            }
            throw error;
        }
    }
    async remove(id) {
        try {
            const softDeletedOrganization = await this.prisma.organization.update({
                where: { organization_id: id },
                data: {
                    is_deleted: true,
                    deleted_at: new Date(),
                },
            });
            return softDeletedOrganization;
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new common_1.NotFoundException(`Organization with ID ${id} not found`);
                }
            }
            throw error;
        }
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrganizationsService);
