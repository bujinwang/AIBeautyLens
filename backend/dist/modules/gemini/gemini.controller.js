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
exports.GeminiController = void 0;
const common_1 = require("@nestjs/common");
const gemini_service_1 = require("./gemini.service");
const prompt_template_service_1 = require("./prompt-template.service");
const analyze_facial_image_dto_1 = require("./dto/analyze-facial-image.dto");
const analyze_eye_image_dto_1 = require("./dto/analyze-eye-image.dto");
const analyze_before_after_dto_1 = require("./dto/analyze-before-after.dto");
const analyze_hair_scalp_dto_1 = require("./dto/analyze-hair-scalp.dto");
const analyze_gcs_image_dto_1 = require("./dto/analyze-gcs-image.dto");
const prompt_template_dto_1 = require("./dto/prompt-template.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_enum_1 = require("../auth/enums/role.enum");
let GeminiController = class GeminiController {
    constructor(geminiService, promptTemplateService) {
        this.geminiService = geminiService;
        this.promptTemplateService = promptTemplateService;
    }
    async analyze(body) {
        return this.geminiService.analyzeFacialImage(body.imageBase64);
    }
    async analyzeEye(body) {
        return this.geminiService.analyzeEyeImage(body.imageBase64);
    }
    async analyzeBeforeAfter(body) {
        return this.geminiService.analyzeBeforeAfter(body.beforeImageBase64, body.afterImageBase64);
    }
    async analyzeHairScalp(body) {
        return this.geminiService.analyzeHairScalp(body.imageBase64);
    }
    async analyzeGcsImage(body) {
        return this.geminiService.analyzeGcsImage(body.gcsObjectName, body.promptType, body.customPromptId);
    }
    async analyzeBeforeAfterGcs(body) {
        return this.geminiService.analyzeBeforeAfterGcs(body.beforeImageGcsName, body.afterImageGcsName, body.promptType, body.customPromptId);
    }
    async getAllPromptTemplates() {
        return this.promptTemplateService.getAllPromptTemplates();
    }
    async getPromptTemplatesByType(body) {
        return this.promptTemplateService.getPromptTemplatesByType(body.type);
    }
    async getPromptTemplateById(id) {
        return this.promptTemplateService.getPromptTemplateById(id);
    }
    async createPromptTemplate(body) {
        if (body.type === prompt_template_dto_1.PromptType.CUSTOM && (!body.name || !body.description)) {
            throw new common_1.BadRequestException('CUSTOM prompt templates require a name and description');
        }
        return this.promptTemplateService.createPromptTemplate(body);
    }
    async updatePromptTemplate(id, body) {
        return this.promptTemplateService.updatePromptTemplate(id, body);
    }
    async deletePromptTemplate(id) {
        await this.promptTemplateService.deletePromptTemplate(id);
        return { success: true, message: 'Prompt template deleted successfully' };
    }
};
exports.GeminiController = GeminiController;
__decorate([
    (0, common_1.Post)('analyze'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analyze_facial_image_dto_1.AnalyzeFacialImageDto]),
    __metadata("design:returntype", Promise)
], GeminiController.prototype, "analyze", null);
__decorate([
    (0, common_1.Post)('analyze-eye'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analyze_eye_image_dto_1.AnalyzeEyeImageDto]),
    __metadata("design:returntype", Promise)
], GeminiController.prototype, "analyzeEye", null);
__decorate([
    (0, common_1.Post)('analyze-before-after'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analyze_before_after_dto_1.AnalyzeBeforeAfterDto]),
    __metadata("design:returntype", Promise)
], GeminiController.prototype, "analyzeBeforeAfter", null);
__decorate([
    (0, common_1.Post)('analyze-hair-scalp'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analyze_hair_scalp_dto_1.AnalyzeHairScalpDto]),
    __metadata("design:returntype", Promise)
], GeminiController.prototype, "analyzeHairScalp", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('analyze-gcs'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analyze_gcs_image_dto_1.AnalyzeGcsImageDto]),
    __metadata("design:returntype", Promise)
], GeminiController.prototype, "analyzeGcsImage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('analyze-before-after-gcs'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analyze_gcs_image_dto_1.AnalyzeBeforeAfterGcsDto]),
    __metadata("design:returntype", Promise)
], GeminiController.prototype, "analyzeBeforeAfterGcs", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Admin),
    (0, common_1.Get)('prompts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GeminiController.prototype, "getAllPromptTemplates", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Admin, role_enum_1.Role.Clinician),
    (0, common_1.Post)('prompts/by-type'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [prompt_template_dto_1.GetPromptTemplateDto]),
    __metadata("design:returntype", Promise)
], GeminiController.prototype, "getPromptTemplatesByType", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Admin, role_enum_1.Role.Clinician),
    (0, common_1.Get)('prompts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GeminiController.prototype, "getPromptTemplateById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Admin),
    (0, common_1.Post)('prompts'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [prompt_template_dto_1.CreatePromptTemplateDto]),
    __metadata("design:returntype", Promise)
], GeminiController.prototype, "createPromptTemplate", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Admin),
    (0, common_1.Patch)('prompts/:id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, prompt_template_dto_1.UpdatePromptTemplateDto]),
    __metadata("design:returntype", Promise)
], GeminiController.prototype, "updatePromptTemplate", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Admin),
    (0, common_1.Delete)('prompts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GeminiController.prototype, "deletePromptTemplate", null);
exports.GeminiController = GeminiController = __decorate([
    (0, common_1.Controller)('gemini'),
    __metadata("design:paramtypes", [gemini_service_1.GeminiService,
        prompt_template_service_1.PromptTemplateService])
], GeminiController);
