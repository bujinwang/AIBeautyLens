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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreatmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const treatments_service_1 = require("./treatments.service");
const create_treatment_type_dto_1 = require("./dto/create-treatment-type.dto");
const update_treatment_type_dto_1 = require("./dto/update-treatment-type.dto");
const treatment_type_response_dto_1 = require("./dto/treatment-type-response.dto");
const create_treatment_record_dto_1 = require("./dto/create-treatment-record.dto");
const update_treatment_record_dto_1 = require("./dto/update-treatment-record.dto");
const treatment_record_response_dto_1 = require("./dto/treatment-record-response.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_enum_1 = require("../auth/enums/role.enum");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let TreatmentsController = class TreatmentsController {
    constructor(treatmentsService) {
        this.treatmentsService = treatmentsService;
    }
    async createTreatmentType(createTreatmentTypeDto) {
        return this.treatmentsService.createTreatmentType(createTreatmentTypeDto);
    }
    async findAllTreatmentTypes() {
        return this.treatmentsService.findAllTreatmentTypes();
    }
    async findOneTreatmentType(id) {
        return this.treatmentsService.findOneTreatmentType(id);
    }
    async updateTreatmentType(id, updateTreatmentTypeDto) {
        return this.treatmentsService.updateTreatmentType(id, updateTreatmentTypeDto);
    }
    async removeTreatmentType(id) {
        return this.treatmentsService.removeTreatmentType(id);
    }
    async createTreatmentRecord(createTreatmentRecordDto, user) {
        const clinicianId = user.userId;
        return this.treatmentsService.createTreatmentRecord(createTreatmentRecordDto, clinicianId);
    }
    async findAllTreatmentRecords(user, patientIdQuery, clinicianIdQuery) {
        let effectiveClinicianId = clinicianIdQuery;
        let effectivePatientId = patientIdQuery;
        if (user.roles.includes(role_enum_1.Role.Clinician) && !user.roles.includes(role_enum_1.Role.Admin)) {
            effectiveClinicianId = user.userId;
            if (patientIdQuery && !await this.treatmentsService.isPatientAssignedToClinician(patientIdQuery, user.userId)) {
                throw new common_1.ForbiddenException(`Patient with ID "${patientIdQuery}" is not assigned to this clinician.`);
            }
        }
        else if (user.roles.includes(role_enum_1.Role.Patient)) {
            if (!user.patientId) {
                throw new common_1.ForbiddenException('Patient ID not found for the authenticated patient.');
            }
            effectivePatientId = user.patientId;
            if (patientIdQuery && patientIdQuery !== user.patientId) {
                throw new common_1.ForbiddenException(`Patients can only access their own records. Provided patientId "${patientIdQuery}" does not match authenticated patient ID.`);
            }
        }
        return this.treatmentsService.findAllTreatmentRecords(effectivePatientId, effectiveClinicianId);
    }
    async findOneTreatmentRecord(id, user) {
        const record = await this.treatmentsService.findOneTreatmentRecord(id);
        if (user.roles.includes(role_enum_1.Role.Clinician) && !user.roles.includes(role_enum_1.Role.Admin)) {
            if (record.clinicianId !== user.userId) {
                throw new common_1.NotFoundException(`Treatment record with ID "${id}" not found for this clinician.`);
            }
        }
        else if (user.roles.includes(role_enum_1.Role.Patient)) {
            if (!user.patientId) {
                throw new common_1.ForbiddenException('Patient ID not found for the authenticated patient.');
            }
            if (record.patientId !== user.patientId) {
                throw new common_1.NotFoundException(`Treatment record with ID "${id}" not found for this patient.`);
            }
        }
        return record;
    }
    async updateTreatmentRecord(id, updateTreatmentRecordDto, user) {
        const record = await this.treatmentsService.findOneTreatmentRecord(id);
        if (record.clinicianId !== user.userId) {
            throw new common_1.NotFoundException(`Treatment record with ID "${id}" not found for this clinician, or you do not have permission to update it.`);
        }
        return this.treatmentsService.updateTreatmentRecord(id, updateTreatmentRecordDto);
    }
    async removeTreatmentRecord(id, user) {
        const record = await this.treatmentsService.findOneTreatmentRecord(id);
        if (user.roles.includes(role_enum_1.Role.Clinician) && !user.roles.includes(role_enum_1.Role.Admin)) {
            if (record.clinicianId !== user.userId) {
                throw new common_1.NotFoundException(`Treatment record with ID "${id}" not found for this clinician, or you do not have permission to delete it.`);
            }
        }
        if (!user.roles.includes(role_enum_1.Role.Admin) && record.clinicianId !== user.userId) {
            throw new common_1.NotFoundException(`Treatment record with ID "${id}" not found or permission denied.`);
        }
        await this.treatmentsService.removeTreatmentRecord(id);
    }
};
exports.TreatmentsController = TreatmentsController;
__decorate([
    (0, common_1.Post)('treatment-types'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Admin),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new treatment type' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Treatment type created successfully.', type: treatment_type_response_dto_1.TreatmentTypeResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_treatment_type_dto_1.CreateTreatmentTypeDto]),
    __metadata("design:returntype", Promise)
], TreatmentsController.prototype, "createTreatmentType", null);
__decorate([
    (0, common_1.Get)('treatment-types'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Admin, role_enum_1.Role.Clinician, role_enum_1.Role.Patient),
    (0, swagger_1.ApiOperation)({ summary: 'Get all active treatment types' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of active treatment types.', type: [treatment_type_response_dto_1.TreatmentTypeResponseDto] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TreatmentsController.prototype, "findAllTreatmentTypes", null);
__decorate([
    (0, common_1.Get)('treatment-types/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Admin, role_enum_1.Role.Clinician, role_enum_1.Role.Patient),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific treatment type by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Treatment type details.', type: treatment_type_response_dto_1.TreatmentTypeResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TreatmentsController.prototype, "findOneTreatmentType", null);
__decorate([
    (0, common_1.Patch)('treatment-types/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Admin),
    (0, swagger_1.ApiOperation)({ summary: 'Update a treatment type' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Treatment type updated successfully.', type: treatment_type_response_dto_1.TreatmentTypeResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_treatment_type_dto_1.UpdateTreatmentTypeDto]),
    __metadata("design:returntype", Promise)
], TreatmentsController.prototype, "updateTreatmentType", null);
__decorate([
    (0, common_1.Delete)('treatment-types/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Admin),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate a treatment type' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Treatment type deactivated successfully.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TreatmentsController.prototype, "removeTreatmentType", null);
__decorate([
    (0, common_1.Post)('treatment-records'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Clinician),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new treatment record' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Treatment record created successfully.', type: treatment_record_response_dto_1.TreatmentRecordResponseDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_treatment_record_dto_1.CreateTreatmentRecordDto, Object]),
    __metadata("design:returntype", Promise)
], TreatmentsController.prototype, "createTreatmentRecord", null);
__decorate([
    (0, common_1.Get)('treatment-records'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Clinician, role_enum_1.Role.Patient, role_enum_1.Role.Admin),
    (0, swagger_1.ApiOperation)({ summary: 'Get treatment records (with optional filters)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of treatment records.', type: [treatment_record_response_dto_1.TreatmentRecordResponseDto] }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('patientId')),
    __param(2, (0, common_1.Query)('clinicianId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], TreatmentsController.prototype, "findAllTreatmentRecords", null);
__decorate([
    (0, common_1.Get)('treatment-records/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Clinician, role_enum_1.Role.Patient, role_enum_1.Role.Admin),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific treatment record by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Treatment record details.', type: treatment_record_response_dto_1.TreatmentRecordResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TreatmentsController.prototype, "findOneTreatmentRecord", null);
__decorate([
    (0, common_1.Patch)('treatment-records/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Clinician),
    (0, swagger_1.ApiOperation)({ summary: 'Update a treatment record' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Treatment record updated successfully.', type: treatment_record_response_dto_1.TreatmentRecordResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_treatment_record_dto_1.UpdateTreatmentRecordDto, Object]),
    __metadata("design:returntype", Promise)
], TreatmentsController.prototype, "updateTreatmentRecord", null);
__decorate([
    (0, common_1.Delete)('treatment-records/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Clinician, role_enum_1.Role.Admin),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a treatment record' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Treatment record deleted successfully.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TreatmentsController.prototype, "removeTreatmentRecord", null);
exports.TreatmentsController = TreatmentsController = __decorate([
    (0, swagger_1.ApiTags)('Treatments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [treatments_service_1.TreatmentsService])
], TreatmentsController);
