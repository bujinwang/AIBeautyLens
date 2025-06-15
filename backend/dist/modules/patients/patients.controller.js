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
exports.PatientsController = void 0;
const common_1 = require("@nestjs/common");
const patients_service_1 = require("./patients.service");
const create_patient_dto_1 = require("./dto/create-patient.dto");
const update_patient_dto_1 = require("./dto/update-patient.dto");
const filter_patient_dto_1 = require("./dto/filter-patient.dto");
const create_patient_by_clinician_dto_1 = require("./dto/create-patient-by-clinician.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_enum_1 = require("../auth/enums/role.enum");
let PatientsController = class PatientsController {
    constructor(patientsService) {
        this.patientsService = patientsService;
    }
    createByClinician(createPatientByClinicianDto, req) {
        const clinicianId = req.user.userId;
        return this.patientsService.createPatientByClinician(createPatientByClinicianDto, clinicianId);
    }
    create(createPatientDto) {
        return this.patientsService.create(createPatientDto);
    }
    findAll(filterPatientDto, req) {
        const clinicianId = req.user.roles.includes(role_enum_1.Role.Admin) ? undefined : req.user.userId;
        return this.patientsService.findAll(filterPatientDto, clinicianId);
    }
    findOne(id, req) {
        const clinicianId = req.user.roles.includes(role_enum_1.Role.Admin) ? undefined : req.user.userId;
        return this.patientsService.findOne(id, clinicianId);
    }
    update(id, updatePatientDto) {
        return this.patientsService.update(id, updatePatientDto);
    }
    remove(id) {
        return this.patientsService.remove(id);
    }
};
exports.PatientsController = PatientsController;
__decorate([
    (0, common_1.Post)('register-by-clinician'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Admin, role_enum_1.Role.Clinician),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_patient_by_clinician_dto_1.CreatePatientByClinicianDto, Object]),
    __metadata("design:returntype", void 0)
], PatientsController.prototype, "createByClinician", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Admin),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_patient_dto_1.CreatePatientDto]),
    __metadata("design:returntype", void 0)
], PatientsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Admin, role_enum_1.Role.Clinician),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_patient_dto_1.FilterPatientDto, Object]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Admin, role_enum_1.Role.Clinician),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PatientsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Admin, role_enum_1.Role.Clinician),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_patient_dto_1.UpdatePatientDto]),
    __metadata("design:returntype", void 0)
], PatientsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Admin),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PatientsController.prototype, "remove", null);
exports.PatientsController = PatientsController = __decorate([
    (0, common_1.Controller)('patients'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [patients_service_1.PatientsService])
], PatientsController);
