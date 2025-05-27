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
exports.RequestAnalysisDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class RequestAnalysisDto {
}
exports.RequestAnalysisDto = RequestAnalysisDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The type of analysis to perform (e.g., "pore_analysis_detailed").',
        example: 'pore_analysis_detailed',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RequestAnalysisDto.prototype, "analysisType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of the prompt configuration to use for this analysis. If omitted, a default or type-specific prompt might be used.',
        example: 'prompt_config_xyz_456',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RequestAnalysisDto.prototype, "promptConfigurationId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Any specific parameters for this particular analysis run. This is a free-form object.',
        example: { sensitivity: 'high', region: 'T-zone' },
        type: 'object',
        additionalProperties: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], RequestAnalysisDto.prototype, "analysisParameters", void 0);
