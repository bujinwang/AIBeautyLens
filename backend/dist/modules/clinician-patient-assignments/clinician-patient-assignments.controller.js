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
exports.ClinicianPatientAssignmentsController = void 0;
const common_1 = require("@nestjs/common");
const clinician_patient_assignments_service_1 = require("./clinician-patient-assignments.service");
const create_clinician_patient_assignment_dto_1 = require("./dto/create-clinician-patient-assignment.dto");
const update_clinician_patient_assignment_dto_1 = require("./dto/update-clinician-patient-assignment.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_enum_1 = require("../auth/enums/role.enum");
let ClinicianPatientAssignmentsController = class ClinicianPatientAssignmentsController {
    constructor(assignmentsService) {
        this.assignmentsService = assignmentsService;
    }
    create(createAssignmentDto) {
        const data = {
            clinician: { connect: { clinician_id: createAssignmentDto.clinician_id } },
            patient: { connect: { patient_id: createAssignmentDto.patient_id } },
            ...(createAssignmentDto.assignment_date && { assignment_date: new Date(createAssignmentDto.assignment_date) }),
            ...(createAssignmentDto.status && { status: createAssignmentDto.status }),
        };
        return this.assignmentsService.create(data);
    }
    findAll() {
        return this.assignmentsService.findAll();
    }
    findForClinician(clinicianId) {
        return this.assignmentsService.findAssignmentsForClinician(clinicianId);
    }
    findForPatient(patientId) {
        return this.assignmentsService.findAssignmentsForPatient(patientId);
    }
    findOne(assignmentId) {
        return this.assignmentsService.findOne(assignmentId);
    }
    update(assignmentId, updateAssignmentDto) {
        const data = {
            ...(updateAssignmentDto.assignment_date && { assignment_date: new Date(updateAssignmentDto.assignment_date) }),
            ...(updateAssignmentDto.status && { status: updateAssignmentDto.status }),
        };
        return this.assignmentsService.update(assignmentId, data);
    }
    remove(assignmentId) {
        return this.assignmentsService.remove(assignmentId);
    }
};
exports.ClinicianPatientAssignmentsController = ClinicianPatientAssignmentsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Admin, role_enum_1.Role.Clinician),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_clinician_patient_assignment_dto_1.CreateClinicianPatientAssignmentDto]),
    __metadata("design:returntype", void 0)
], ClinicianPatientAssignmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Admin),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ClinicianPatientAssignmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('clinician/:clinicianId'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Admin, role_enum_1.Role.Clinician),
    __param(0, (0, common_1.Param)('clinicianId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ClinicianPatientAssignmentsController.prototype, "findForClinician", null);
__decorate([
    (0, common_1.Get)('patient/:patientId'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Admin, role_enum_1.Role.Clinician),
    __param(0, (0, common_1.Param)('patientId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ClinicianPatientAssignmentsController.prototype, "findForPatient", null);
__decorate([
    (0, common_1.Get)(':assignmentId'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Admin, role_enum_1.Role.Clinician),
    __param(0, (0, common_1.Param)('assignmentId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ClinicianPatientAssignmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':assignmentId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Admin),
    __param(0, (0, common_1.Param)('assignmentId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_clinician_patient_assignment_dto_1.UpdateClinicianPatientAssignmentDto]),
    __metadata("design:returntype", void 0)
], ClinicianPatientAssignmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':assignmentId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Admin),
    __param(0, (0, common_1.Param)('assignmentId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ClinicianPatientAssignmentsController.prototype, "remove", null);
exports.ClinicianPatientAssignmentsController = ClinicianPatientAssignmentsController = __decorate([
    (0, common_1.Controller)('clinician-patient-assignments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [clinician_patient_assignments_service_1.ClinicianPatientAssignmentsService])
], ClinicianPatientAssignmentsController);
