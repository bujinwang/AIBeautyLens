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
exports.ImageResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const analysis_record_response_dto_1 = require("./analysis-record-response.dto");
class ImageResponseDto {
}
exports.ImageResponseDto = ImageResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique ID of the image', example: 'image_abc123' }),
    __metadata("design:type", String)
], ImageResponseDto.prototype, "imageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'GCS path of the image', example: 'patient-uploads/image123.jpg' }),
    __metadata("design:type", String)
], ImageResponseDto.prototype, "gcsPath", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the patient this image belongs to', example: 'patient_uuid_123' }),
    __metadata("design:type", String)
], ImageResponseDto.prototype, "patientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the clinician who uploaded/owns this image', example: 'clinician_uuid_456' }),
    __metadata("design:type", String)
], ImageResponseDto.prototype, "clinicianId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp of when the image was uploaded', example: '2023-10-27T10:00:00.000Z' }),
    __metadata("design:type", Date)
], ImageResponseDto.prototype, "uploadTimestamp", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Original filename of the uploaded image', example: 'photo_01.jpg' }),
    __metadata("design:type", String)
], ImageResponseDto.prototype, "originalFileName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Content type of the image', example: 'image/jpeg' }),
    __metadata("design:type", String)
], ImageResponseDto.prototype, "contentType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Optional notes provided by the clinician for this image', example: 'Pre-treatment, right cheek.' }),
    __metadata("design:type", String)
], ImageResponseDto.prototype, "imageNotes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of analysis records associated with this image',
        type: [analysis_record_response_dto_1.AnalysisRecordResponseDto],
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => analysis_record_response_dto_1.AnalysisRecordResponseDto),
    __metadata("design:type", Array)
], ImageResponseDto.prototype, "analyses", void 0);
