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
exports.AnalysisRecordResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class AnalysisRecordResponseDto {
}
exports.AnalysisRecordResponseDto = AnalysisRecordResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique ID of the analysis record', example: 'analysis_789xyz' }),
    __metadata("design:type", String)
], AnalysisRecordResponseDto.prototype, "analysisId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the image this analysis pertains to', example: 'image_abc123' }),
    __metadata("design:type", String)
], AnalysisRecordResponseDto.prototype, "imageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp of when the analysis was performed or completed', example: '2023-10-27T10:30:00.000Z' }),
    __metadata("design:type", Date)
], AnalysisRecordResponseDto.prototype, "analysisTimestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type of analysis performed', example: 'skin_hydration_v1' }),
    __metadata("design:type", String)
], AnalysisRecordResponseDto.prototype, "analysisType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID of the prompt configuration used', example: 'prompt_config_abc_123' }),
    __metadata("design:type", String)
], AnalysisRecordResponseDto.prototype, "promptConfigurationId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Specific parameters used for this analysis run',
        type: 'object',
        additionalProperties: true,
        example: { sensitivity: 'high' },
    }),
    __metadata("design:type", Object)
], AnalysisRecordResponseDto.prototype, "analysisParameters", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current status of the analysis', example: 'completed' }),
    __metadata("design:type", String)
], AnalysisRecordResponseDto.prototype, "analysisStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'The structured result from the AI analysis',
        type: 'object',
        additionalProperties: true,
        example: { score: 0.85, feedback: 'Skin is well hydrated.' },
    }),
    __metadata("design:type", Object)
], AnalysisRecordResponseDto.prototype, "analysisResult", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Error message if the analysis failed' }),
    __metadata("design:type", String)
], AnalysisRecordResponseDto.prototype, "errorMessage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID of the clinician who initiated this specific analysis, if applicable', example: 'clinician_def456' }),
    __metadata("design:type", String)
], AnalysisRecordResponseDto.prototype, "initiatedByClinicianId", void 0);
