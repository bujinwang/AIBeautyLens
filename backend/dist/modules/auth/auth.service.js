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
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
const email_service_1 = require("../../common/services/email.service");
let AuthService = class AuthService {
    constructor(cliniciansService, jwtService, configService) {
        this.cliniciansService = cliniciansService;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(registrationData) {
        const existingClinician = await this.cliniciansService.findOneByEmail(registrationData.email);
        if (existingClinician) {
            throw new common_1.ConflictException('Email already exists');
        }
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(registrationData.password, salt);
        const verificationToken = this.generateToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const createInput = {
            email: registrationData.email,
            name: registrationData.name,
            specialty: registrationData.specialty,
            hashed_password: hashedPassword,
            salt: salt,
            roles: [role_enum_1.Role.Clinician],
            verification_token: verificationToken,
            verification_token_expires: verificationExpires,
            email_verified: false,
        };
        const newClinician = await this.cliniciansService.create(createInput);
        await (0, email_service_1.sendVerificationEmail)(newClinician.email, newClinician.name, verificationToken);
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
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.generateRefreshToken();
        const refreshTokenExpires = new Date(Date.now() + Number(this.configService.get('JWT_REFRESH_EXPIRATION_TIME', 7 * 24 * 60 * 60 * 1000)));
        await this.cliniciansService.update(clinician.clinician_id, {
            refresh_token: refreshToken,
            refresh_token_expires: refreshTokenExpires,
        });
        return {
            accessToken,
            refreshToken,
        };
    }
    async refreshToken(refreshToken) {
        const clinician = await this.findClinicianByRefreshToken(refreshToken);
        if (!clinician) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (clinician.refresh_token_expires && clinician.refresh_token_expires < new Date()) {
            throw new common_1.UnauthorizedException('Refresh token expired');
        }
        const payload = {
            email: clinician.email,
            sub: clinician.clinician_id,
            roles: clinician.roles,
        };
        const accessToken = this.jwtService.sign(payload);
        const newRefreshToken = this.generateRefreshToken();
        const refreshTokenExpires = new Date(Date.now() + Number(this.configService.get('JWT_REFRESH_EXPIRATION_TIME', 7 * 24 * 60 * 60 * 1000)));
        await this.cliniciansService.update(clinician.clinician_id, {
            refresh_token: newRefreshToken,
            refresh_token_expires: refreshTokenExpires,
        });
        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }
    async verifyEmail(token) {
        const clinician = await this.findClinicianByVerificationToken(token);
        if (!clinician) {
            throw new common_1.NotFoundException('Invalid verification token');
        }
        if (clinician.verification_token_expires && clinician.verification_token_expires < new Date()) {
            throw new common_1.BadRequestException('Verification token expired');
        }
        await this.cliniciansService.update(clinician.clinician_id, {
            email_verified: true,
            verification_token: null,
            verification_token_expires: null,
        });
    }
    async requestPasswordReset(email) {
        const clinician = await this.cliniciansService.findOneByEmail(email);
        if (!clinician) {
            return;
        }
        const resetToken = this.generateToken();
        const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000);
        await this.cliniciansService.update(clinician.clinician_id, {
            password_reset_token: resetToken,
            password_reset_expires: resetExpires,
        });
        await (0, email_service_1.sendPasswordResetEmail)(clinician.email, clinician.name, resetToken);
    }
    async resetPassword(token, password, passwordConfirmation) {
        if (password !== passwordConfirmation) {
            throw new common_1.BadRequestException('Passwords do not match');
        }
        const clinician = await this.findClinicianByResetToken(token);
        if (!clinician) {
            throw new common_1.NotFoundException('Invalid reset token');
        }
        if (clinician.password_reset_expires && clinician.password_reset_expires < new Date()) {
            throw new common_1.BadRequestException('Reset token expired');
        }
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        await this.cliniciansService.update(clinician.clinician_id, {
            hashed_password: hashedPassword,
            salt,
            password_reset_token: null,
            password_reset_expires: null,
            refresh_token: null,
            refresh_token_expires: null,
        });
    }
    async logout(clinicianId) {
        await this.cliniciansService.update(clinicianId, {
            refresh_token: null,
            refresh_token_expires: null,
        });
    }
    async resendVerificationEmail(email) {
        const clinician = await this.cliniciansService.findOneByEmail(email);
        if (!clinician) {
            return;
        }
        if (clinician.email_verified) {
            throw new common_1.BadRequestException('Email already verified');
        }
        const verificationToken = this.generateToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await this.cliniciansService.update(clinician.clinician_id, {
            verification_token: verificationToken,
            verification_token_expires: verificationExpires,
        });
        await (0, email_service_1.sendVerificationEmail)(clinician.email, clinician.name, verificationToken);
    }
    generateToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    generateRefreshToken() {
        return crypto.randomBytes(40).toString('hex');
    }
    async findClinicianByVerificationToken(token) {
        return this.cliniciansService.findOneByVerificationToken(token);
    }
    async findClinicianByResetToken(token) {
        return this.cliniciansService.findOneByResetToken(token);
    }
    async findClinicianByRefreshToken(token) {
        return this.cliniciansService.findOneByRefreshToken(token);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [clinicians_service_1.CliniciansService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
