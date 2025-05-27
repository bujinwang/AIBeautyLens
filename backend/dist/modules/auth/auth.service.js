"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const clinicians_service_1 = require("../clinicians/clinicians.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const role_enum_1 = require("./enums/role.enum");
let AuthService = class AuthService {
    constructor(cliniciansService, jwtService) {
        this.cliniciansService = cliniciansService;
        this.jwtService = jwtService;
    }
    async register(registrationData) {
        const existingClinician = await this.cliniciansService.findOneByEmail(registrationData.email);
        if (existingClinician) {
            throw new common_1.ConflictException('Email already exists');
        }
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(registrationData.password, salt);
        const createInput = {
            email: registrationData.email,
            name: registrationData.name,
            specialty: registrationData.specialty,
            hashed_password: hashedPassword,
            salt: salt,
            roles: [role_enum_1.Role.Clinician],
        };
        const newClinician = await this.cliniciansService.create(createInput);
        return this.cliniciansService.excludePasswordFields(newClinician);
    }
    async validateUser(email, pass) {
        const clinician = await this.cliniciansService.findOneByEmail(email);
        if (clinician && clinician.hashed_password && clinician.salt) {
            const isPasswordMatching = await bcrypt.compare(pass, clinician.hashed_password);
            if (isPasswordMatching) {
                return this.cliniciansService.excludePasswordFields(clinician);
            }
        }
        return null;
    }
    async login(clinician) {
        const payload = {
            email: clinician.email,
            sub: clinician.clinician_id,
            roles: clinician.roles,
        };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [clinicians_service_1.CliniciansService,
        jwt_1.JwtService])
], AuthService);
