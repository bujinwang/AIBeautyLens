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
exports.GetPromptTemplateDto = exports.UpdatePromptTemplateDto = exports.CreatePromptTemplateDto = exports.PromptType = void 0;
const class_validator_1 = require("class-validator");
var PromptType;
(function (PromptType) {
    PromptType["FACIAL"] = "facial";
    PromptType["EYE"] = "eye";
    PromptType["BEFORE_AFTER"] = "beforeAfter";
    PromptType["HAIR_SCALP"] = "hairScalp";
    PromptType["CUSTOM"] = "custom";
})(PromptType || (exports.PromptType = PromptType = {}));
class CreatePromptTemplateDto {
}
exports.CreatePromptTemplateDto = CreatePromptTemplateDto;
__decorate([
    (0, class_validator_1.IsEnum)(PromptType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePromptTemplateDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePromptTemplateDto.prototype, "prompt", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePromptTemplateDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePromptTemplateDto.prototype, "description", void 0);
class UpdatePromptTemplateDto {
}
exports.UpdatePromptTemplateDto = UpdatePromptTemplateDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePromptTemplateDto.prototype, "prompt", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePromptTemplateDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePromptTemplateDto.prototype, "description", void 0);
class GetPromptTemplateDto {
}
exports.GetPromptTemplateDto = GetPromptTemplateDto;
__decorate([
    (0, class_validator_1.IsEnum)(PromptType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GetPromptTemplateDto.prototype, "type", void 0);
