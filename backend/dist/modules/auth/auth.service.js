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
const patients_service_1 = require("../patients/patients.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const role_enum_1 = require("./enums/role.enum");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
const email_service_1 = require("../../common/services/email.service");
const prisma_service_1 = require("../../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(cliniciansService, patientsService, jwtService, configService, prisma) {
        this.cliniciansService = cliniciansService;
        this.patientsService = patientsService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.prisma = prisma;
        this.MAX_LOGIN_ATTEMPTS = this.configService.get('MAX_LOGIN_ATTEMPTS', 5);
        this.LOCKOUT_DURATION_MINUTES = this.configService.get('LOCKOUT_DURATION_MINUTES', 30);
    }
    async register(registrationData) {
        const existingUser = await this.prisma.user.findUnique({ where: { email: registrationData.email } });
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(registrationData.password, salt);
        const verificationToken = this.generateToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const newUser = await this.prisma.user.create({
            data: {
                email: registrationData.email,
                hashed_password: hashedPassword,
                salt: salt,
                roles: [role_enum_1.Role.Clinician],
                verification_token: verificationToken,
                verification_token_expires: verificationExpires,
                email_verified: false,
            },
        });
        const newClinician = await this.cliniciansService.create({
            name: registrationData.name,
            specialty: registrationData.specialty,
            user: { connect: { user_id: newUser.user_id } },
        });
        await (0, email_service_1.sendVerificationEmail)(newUser.email, newClinician.name, verificationToken);
        return this.cliniciansService.excludeUserPasswordFields({ ...newClinician, user: newUser });
    }
    async registerPatient(registrationData) {
        const existingUser = await this.prisma.user.findUnique({ where: { email: registrationData.email } });
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(registrationData.password, salt);
        const verificationToken = this.generateToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const newUser = await this.prisma.user.create({
            data: {
                email: registrationData.email,
                hashed_password: hashedPassword,
                salt: salt,
                roles: [role_enum_1.Role.Patient],
                verification_token: verificationToken,
                verification_token_expires: verificationExpires,
                email_verified: false,
            },
        });
        const newPatient = await this.patientsService.create({
            full_name: registrationData.full_name,
            date_of_birth: registrationData.date_of_birth ? new Date(registrationData.date_of_birth) : undefined,
            gender: registrationData.gender,
            contact_info: registrationData.contact_info,
            additional_phi_details: registrationData.additional_phi_details,
            user: { connect: { user_id: newUser.user_id } },
        });
        return this.patientsService.excludeUserPasswordFields({ ...newPatient, user: newUser });
    }
    async validateUser(email, pass) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return null;
        }
        if (user.is_locked_out && user.lockout_until && user.lockout_until > new Date()) {
            throw new common_1.UnauthorizedException('Account locked. Please try again later.');
        }
        const isPasswordMatching = await bcrypt.compare(pass, user.hashed_password);
        if (isPasswordMatching) {
            if (user.failed_login_attempts > 0 || user.is_locked_out) {
                await this.prisma.user.update({
                    where: { user_id: user.user_id },
                    data: {
                        failed_login_attempts: 0,
                        is_locked_out: false,
                        lockout_until: null,
                    },
                });
            }
            const { hashed_password, salt, ...result } = user;
            return result;
        }
        else {
            const updatedAttempts = (user.failed_login_attempts || 0) + 1;
            let lockoutUntil = null;
            let isLockedOut = false;
            if (updatedAttempts >= this.MAX_LOGIN_ATTEMPTS) {
                isLockedOut = true;
                lockoutUntil = new Date(Date.now() + this.LOCKOUT_DURATION_MINUTES * 60 * 1000);
            }
            await this.prisma.user.update({
                where: { user_id: user.user_id },
                data: {
                    failed_login_attempts: updatedAttempts,
                    is_locked_out: isLockedOut,
                    lockout_until: lockoutUntil,
                },
            });
            if (isLockedOut) {
                throw new common_1.UnauthorizedException('Too many failed login attempts. Account locked.');
            }
        }
        return null;
    }
    async login(user) {
        const payload = {
            email: user.email,
            sub: user.user_id,
            roles: user.roles,
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.generateRefreshToken();
        const refreshTokenExpires = new Date(Date.now() + Number(this.configService.get('JWT_REFRESH_EXPIRATION_TIME', 7 * 24 * 60 * 60 * 1000)));
        await this.prisma.user.update({
            where: { user_id: user.user_id },
            data: {
                refresh_token: refreshToken,
                refresh_token_expires: refreshTokenExpires,
            },
        });
        return {
            accessToken,
            refreshToken,
        };
    }
    async refreshToken(refreshToken) {
        const user = await this.prisma.user.findFirst({ where: { refresh_token: refreshToken, is_deleted: false } });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (user.refresh_token_expires && user.refresh_token_expires < new Date()) {
            throw new common_1.UnauthorizedException('Refresh token expired');
        }
        const payload = {
            email: user.email,
            sub: user.user_id,
            roles: user.roles,
        };
        const accessToken = this.jwtService.sign(payload);
        const newRefreshToken = this.generateRefreshToken();
        const refreshTokenExpires = new Date(Date.now() + Number(this.configService.get('JWT_REFRESH_EXPIRATION_TIME', 7 * 24 * 60 * 60 * 1000)));
        await this.prisma.user.update({
            where: { user_id: user.user_id },
            data: {
                refresh_token: newRefreshToken,
                refresh_token_expires: refreshTokenExpires,
            },
        });
        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }
    async verifyEmail(token) {
        const user = await this.prisma.user.findUnique({ where: { verification_token: token, is_deleted: false } });
        if (!user) {
            throw new common_1.NotFoundException('Invalid verification token');
        }
        if (user.verification_token_expires && user.verification_token_expires < new Date()) {
            throw new common_1.BadRequestException('Verification token expired');
        }
        await this.prisma.user.update({
            where: { user_id: user.user_id },
            data: {
                email_verified: true,
                verification_token: null,
                verification_token_expires: null,
            },
        });
    }
    async requestPasswordReset(email) {
        const user = await this.prisma.user.findUnique({ where: { email, is_deleted: false } });
        if (!user) {
            return;
        }
        const resetToken = this.generateToken();
        const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000);
        await this.prisma.user.update({
            where: { user_id: user.user_id },
            data: {
                password_reset_token: resetToken,
                password_reset_expires: resetExpires,
            },
        });
        await (0, email_service_1.sendPasswordResetEmail)(user.email, user.email, resetToken);
    }
    async resetPassword(token, password, passwordConfirmation) {
        if (password !== passwordConfirmation) {
            throw new common_1.BadRequestException('Passwords do not match');
        }
        const user = await this.prisma.user.findUnique({ where: { password_reset_token: token, is_deleted: false } });
        if (!user) {
            throw new common_1.NotFoundException('Invalid reset token');
        }
        if (user.password_reset_expires && user.password_reset_expires < new Date()) {
            throw new common_1.BadRequestException('Reset token expired');
        }
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        await this.prisma.user.update({
            where: { user_id: user.user_id },
            data: {
                hashed_password: hashedPassword,
                salt,
                password_reset_token: null,
                password_reset_expires: null,
                refresh_token: null,
                refresh_token_expires: null,
            },
        });
    }
    async logout(userId) {
        await this.prisma.user.update({
            where: { user_id: userId },
            data: {
                refresh_token: null,
                refresh_token_expires: null,
            },
        });
    }
    async resendVerificationEmail(email) {
        const user = await this.prisma.user.findUnique({ where: { email, is_deleted: false } });
        if (!user) {
            return;
        }
        if (user.email_verified) {
            throw new common_1.BadRequestException('Email already verified');
        }
        const verificationToken = this.generateToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await this.prisma.user.update({
            where: { user_id: user.user_id },
            data: {
                verification_token: verificationToken,
                verification_token_expires: verificationExpires,
            },
        });
        await (0, email_service_1.sendVerificationEmail)(user.email, user.email, verificationToken);
    }
    generateToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    generateRefreshToken() {
        return crypto.randomBytes(40).toString('hex');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [clinicians_service_1.CliniciansService,
        patients_service_1.PatientsService,
        jwt_1.JwtService,
        config_1.ConfigService,
        prisma_service_1.PrismaService])
], AuthService);
