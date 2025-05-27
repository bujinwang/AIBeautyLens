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
exports.GcsController = void 0;
const common_1 = require("@nestjs/common");
const gcs_service_1 = require("./gcs.service");
const generate_signed_url_dto_1 = require("./dto/generate-signed-url.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let GcsController = class GcsController {
    constructor(gcsService) {
        this.gcsService = gcsService;
    }
    async generateSignedUrl(generateSignedUrlDto, req) {
        const { filename, fileExtension, expirationMinutes } = generateSignedUrlDto;
        const ip = req.ip || 'unknown';
        const url = await this.gcsService.generateSignedUrl(filename, fileExtension, expirationMinutes, ip);
        return { url };
    }
    async logUploadSuccess({ objectName }, req) {
        await this.gcsService.logSuccessfulUpload(objectName, req.ip || 'unknown');
        return { success: true };
    }
    async logUploadFailure({ objectName, error }, req) {
        await this.gcsService.logFailedUpload(objectName, error, req.ip || 'unknown');
        return { success: true };
    }
    async testHealth() {
        return { status: 'ok', message: 'GCS service is healthy' };
    }
    async testSignedUrl(generateSignedUrlDto, req) {
        const { filename, fileExtension, expirationMinutes } = generateSignedUrlDto;
        const ip = req.ip || 'unknown';
        try {
            const url = await this.gcsService.generateSignedUrl(filename, fileExtension, expirationMinutes, ip);
            return { url };
        }
        catch (error) {
            return {
                error: error.message || String(error),
                note: 'This is a test endpoint. In production, use the authenticated endpoint.'
            };
        }
    }
};
exports.GcsController = GcsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('signed-url'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_signed_url_dto_1.GenerateSignedUrlDto, Object]),
    __metadata("design:returntype", Promise)
], GcsController.prototype, "generateSignedUrl", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('log-upload-success'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GcsController.prototype, "logUploadSuccess", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('log-upload-failure'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GcsController.prototype, "logUploadFailure", null);
__decorate([
    (0, common_1.Get)('test-health'),
    (0, common_1.HttpCode)(200),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GcsController.prototype, "testHealth", null);
__decorate([
    (0, common_1.Post)('test-signed-url'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_signed_url_dto_1.GenerateSignedUrlDto, Object]),
    __metadata("design:returntype", Promise)
], GcsController.prototype, "testSignedUrl", null);
exports.GcsController = GcsController = __decorate([
    (0, common_1.Controller)('gcs'),
    __metadata("design:paramtypes", [gcs_service_1.GcsService])
], GcsController);
