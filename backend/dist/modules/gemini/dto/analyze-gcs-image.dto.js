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
exports.AnalyzeBeforeAfterGcsDto = exports.AnalyzeGcsImageDto = void 0;
const class_validator_1 = require("class-validator");
const prompt_template_dto_1 = require("./prompt-template.dto");
class AnalyzeGcsImageDto {
}
exports.AnalyzeGcsImageDto = AnalyzeGcsImageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AnalyzeGcsImageDto.prototype, "gcsObjectName", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(prompt_template_dto_1.PromptType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AnalyzeGcsImageDto.prototype, "promptType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AnalyzeGcsImageDto.prototype, "customPromptId", void 0);
class AnalyzeBeforeAfterGcsDto {
    constructor() {
        this.promptType = prompt_template_dto_1.PromptType.BEFORE_AFTER;
    }
}
exports.AnalyzeBeforeAfterGcsDto = AnalyzeBeforeAfterGcsDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AnalyzeBeforeAfterGcsDto.prototype, "beforeImageGcsName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AnalyzeBeforeAfterGcsDto.prototype, "afterImageGcsName", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(prompt_template_dto_1.PromptType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AnalyzeBeforeAfterGcsDto.prototype, "promptType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AnalyzeBeforeAfterGcsDto.prototype, "customPromptId", void 0);
