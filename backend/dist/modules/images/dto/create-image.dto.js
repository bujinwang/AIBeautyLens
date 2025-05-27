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
exports.CreateImageDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateImageDto {
}
exports.CreateImageDto = CreateImageDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The GCS path/name of the uploaded image.',
        example: 'patient-uploads/image123.jpg',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateImageDto.prototype, "gcsPath", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The ID of the patient this image belongs to.',
        example: '07e75f48-2484-46a9-869c-99325e516133',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateImageDto.prototype, "patientId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'The type of initial analysis to perform (e.g., "skin_hydration_v1"). If omitted, a default might be applied or no initial analysis triggered.',
        example: 'skin_hydration_v1',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateImageDto.prototype, "initialAnalysisType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of the prompt configuration to use for the initial analysis. Required if initialAnalysisType is provided and needs a specific prompt.',
        example: 'prompt_config_abc_123',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateImageDto.prototype, "initialPromptConfigurationId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Original filename of the uploaded image.',
        example: 'photo_01.jpg',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateImageDto.prototype, "originalFileName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Content type of the uploaded image.',
        example: 'image/jpeg',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateImageDto.prototype, "contentType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional notes provided by the clinician for this image.',
        example: 'Image taken pre-treatment, right cheek.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateImageDto.prototype, "imageNotes", void 0);
