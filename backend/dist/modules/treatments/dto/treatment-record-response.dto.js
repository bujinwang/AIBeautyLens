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
exports.TreatmentRecordResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const treatment_type_response_dto_1 = require("./treatment-type-response.dto");
class TreatmentRecordResponseDto {
}
exports.TreatmentRecordResponseDto = TreatmentRecordResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique ID of the treatment record', example: 'uuid-for-treatment-record' }),
    __metadata("design:type", String)
], TreatmentRecordResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date and time the treatment was administered', example: '2023-10-28T14:30:00.000Z' }),
    __metadata("design:type", Date)
], TreatmentRecordResponseDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Clinician notes about this specific treatment instance',
        example: 'Patient tolerated procedure well.',
    }),
    __metadata("design:type", String)
], TreatmentRecordResponseDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total price of the treatment', example: 150.75, type: Number }),
    __metadata("design:type", Number)
], TreatmentRecordResponseDto.prototype, "totalPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Currency code for the total price (ISO 4217)', example: 'CAD' }),
    __metadata("design:type", String)
], TreatmentRecordResponseDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the patient who received the treatment', example: 'patient-uuid-123' }),
    __metadata("design:type", String)
], TreatmentRecordResponseDto.prototype, "patientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the clinician who administered/recorded the treatment', example: 'clinician-uuid-456' }),
    __metadata("design:type", String)
], TreatmentRecordResponseDto.prototype, "clinicianId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the treatment type administered', example: 'treatment-type-uuid-789' }),
    __metadata("design:type", String)
], TreatmentRecordResponseDto.prototype, "treatmentTypeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => treatment_type_response_dto_1.TreatmentTypeResponseDto, description: 'Details of the treatment type administered' }),
    __metadata("design:type", treatment_type_response_dto_1.TreatmentTypeResponseDto)
], TreatmentRecordResponseDto.prototype, "treatmentType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional ID of the Firestore AnalysisRecord this treatment is related to',
        example: 'firestore-analysis-record-uuid-789',
    }),
    __metadata("design:type", String)
], TreatmentRecordResponseDto.prototype, "firestoreAnalysisRecordId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp of when the record was created', example: '2023-10-28T14:35:00.000Z' }),
    __metadata("design:type", Date)
], TreatmentRecordResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp of when the record was last updated', example: '2023-10-28T14:35:00.000Z' }),
    __metadata("design:type", Date)
], TreatmentRecordResponseDto.prototype, "updatedAt", void 0);
