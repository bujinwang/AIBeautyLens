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
exports.TreatmentTypeResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class TreatmentTypeResponseDto {
}
exports.TreatmentTypeResponseDto = TreatmentTypeResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique ID of the treatment type', example: 'uuid-for-treatment-type' }),
    __metadata("design:type", String)
], TreatmentTypeResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the treatment type', example: 'Microdermabrasion' }),
    __metadata("design:type", String)
], TreatmentTypeResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional description for the treatment type',
        example: 'A minimally invasive procedure to renew overall skin tone and texture.',
    }),
    __metadata("design:type", String)
], TreatmentTypeResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Indicates if the treatment type is active and available for use', example: true }),
    __metadata("design:type", Boolean)
], TreatmentTypeResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp of when the treatment type was created', example: '2023-10-27T10:00:00.000Z' }),
    __metadata("design:type", Date)
], TreatmentTypeResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp of when the treatment type was last updated', example: '2023-10-27T10:00:00.000Z' }),
    __metadata("design:type", Date)
], TreatmentTypeResponseDto.prototype, "updatedAt", void 0);
