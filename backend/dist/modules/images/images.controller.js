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
exports.ImagesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const images_service_1 = require("./images.service");
const create_image_dto_1 = require("./dto/create-image.dto");
const request_analysis_dto_1 = require("./dto/request-analysis.dto");
const image_response_dto_1 = require("./dto/image-response.dto");
const analysis_record_response_dto_1 = require("./dto/analysis-record-response.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_enum_1 = require("../auth/enums/role.enum");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let ImagesController = class ImagesController {
    constructor(imagesService) {
        this.imagesService = imagesService;
    }
    async notifyUpload(createImageDto, user) {
        if (!user.roles.includes(role_enum_1.Role.Clinician)) {
            throw new common_1.ForbiddenException('User is not authorized to create image records.');
        }
        const clinicianId = user.userId;
        return this.imagesService.createImageRecord(createImageDto, clinicianId);
    }
    async requestAnalysis(imageId, requestAnalysisDto, user) {
        if (!user.roles.includes(role_enum_1.Role.Clinician)) {
            throw new common_1.ForbiddenException('User is not authorized to request analyses.');
        }
        const clinicianId = user.userId;
        return this.imagesService.requestNewAnalysis(imageId, clinicianId, requestAnalysisDto, user);
    }
    async getAnalysisHistoryForImage(imageId, user) {
        return this.imagesService.getAnalysesForImage(imageId, user);
    }
    async getSpecificAnalysisRecord(analysisId, user) {
        return this.imagesService.getAnalysisById(analysisId, user);
    }
    async getImageDetailsWithHistory(imageId, user) {
        return this.imagesService.getImageWithHistory(imageId, user);
    }
};
exports.ImagesController = ImagesController;
__decorate([
    (0, common_1.Post)('notify-upload'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Clinician),
    (0, swagger_1.ApiOperation)({ summary: 'Notify backend of a new image upload and create its initial record.' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Image record successfully created.', type: image_response_dto_1.ImageResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden resource.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_image_dto_1.CreateImageDto, Object]),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "notifyUpload", null);
__decorate([
    (0, common_1.Post)(':imageId/analyses'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Clinician),
    (0, swagger_1.ApiOperation)({ summary: 'Request a new analysis for an existing image.' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Analysis successfully requested.', type: analysis_record_response_dto_1.AnalysisRecordResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden resource.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Image not found.' }),
    __param(0, (0, common_1.Param)('imageId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, request_analysis_dto_1.RequestAnalysisDto, Object]),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "requestAnalysis", null);
__decorate([
    (0, common_1.Get)(':imageId/analyses'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Clinician, role_enum_1.Role.Patient),
    (0, swagger_1.ApiOperation)({ summary: 'Get all analysis records for a specific image.' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of analysis records.', type: [analysis_record_response_dto_1.AnalysisRecordResponseDto] }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden resource.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Image not found.' }),
    __param(0, (0, common_1.Param)('imageId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "getAnalysisHistoryForImage", null);
__decorate([
    (0, common_1.Get)('analyses/:analysisId'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Clinician, role_enum_1.Role.Patient),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific analysis record by its ID.' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'The analysis record.', type: analysis_record_response_dto_1.AnalysisRecordResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden resource.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Analysis record not found.' }),
    __param(0, (0, common_1.Param)('analysisId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "getSpecificAnalysisRecord", null);
__decorate([
    (0, common_1.Get)(':imageId'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Clinician, role_enum_1.Role.Patient),
    (0, swagger_1.ApiOperation)({ summary: 'Get image details and its full analysis history.' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Image details with analysis history.', type: image_response_dto_1.ImageResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden resource.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Image not found.' }),
    __param(0, (0, common_1.Param)('imageId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "getImageDetailsWithHistory", null);
exports.ImagesController = ImagesController = __decorate([
    (0, swagger_1.ApiTags)('Images & Analyses'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('images'),
    __metadata("design:paramtypes", [images_service_1.ImagesService])
], ImagesController);
