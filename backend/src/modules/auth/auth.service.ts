import { Injectable, ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { CliniciansService } from '../clinicians/clinicians.service';
import { PatientsService } from '../patients/patients.service'; // Import PatientsService
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma, Clinician, User, Patient } from '@prisma/client'; // Import User and Patient
import { Role } from './enums/role.enum'; // Import Role enum
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { JwtTokens } from './interfaces/jwt-tokens.interface';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../common/services/email.service';
import { RegisterPatientDto } from '../../modules/patients/dto/register-patient.dto'; // Import RegisterPatientDto
import { PrismaService } from '../../prisma/prisma.service'; // Import PrismaService

interface JwtPayload {
  email: string;
  sub: string; // user_id
  roles: string[];
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private cliniciansService: CliniciansService,
    private patientsService: PatientsService, // Inject PatientsService
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService, // Inject PrismaService
  ) {
    this.MAX_LOGIN_ATTEMPTS = this.configService.get<number>('MAX_LOGIN_ATTEMPTS', 5);
    this.LOCKOUT_DURATION_MINUTES = this.configService.get<number>('LOCKOUT_DURATION_MINUTES', 30);
  }

  private readonly MAX_LOGIN_ATTEMPTS: number;
  private readonly LOCKOUT_DURATION_MINUTES: number;

  async register(
    registrationData: { email: string; password: string; name: string; specialty?: string; }
  ): Promise<Clinician & { user: Omit<User, 'hashed_password' | 'salt'> }> {
    const existingUser = await this.prisma.user.findUnique({ where: { email: registrationData.email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(registrationData.password, salt);

    const verificationToken = this.generateToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newUser = await this.prisma.user.create({
      data: {
        email: registrationData.email,
        hashed_password: hashedPassword,
        salt: salt,
        roles: [Role.Clinician],
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

    await sendVerificationEmail(newUser.email, newClinician.name, verificationToken);

    return this.cliniciansService.excludeUserPasswordFields({ ...newClinician, user: newUser });
  }

  async registerPatient(
    registrationData: RegisterPatientDto
  ): Promise<Patient & { user: Omit<User, 'hashed_password' | 'salt'> }> {
    const existingUser = await this.prisma.user.findUnique({ where: { email: registrationData.email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(registrationData.password, salt);

    const verificationToken = this.generateToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newUser = await this.prisma.user.create({
      data: {
        email: registrationData.email,
        hashed_password: hashedPassword,
        salt: salt,
        roles: [Role.Patient],
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

    // Optionally send verification email to patient
    // await sendVerificationEmail(newUser.email, newPatient.full_name, verificationToken);

    return this.patientsService.excludeUserPasswordFields({ ...newPatient, user: newUser }) as Patient & { user: Omit<User, 'hashed_password' | 'salt'> };
  }

  async validateUser(email: string, pass: string): Promise<Omit<User, 'hashed_password' | 'salt'> | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return null;
    }

    if (user.is_locked_out && user.lockout_until && user.lockout_until > new Date()) {
      throw new UnauthorizedException('Account locked. Please try again later.');
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
    } else {
      const updatedAttempts = (user.failed_login_attempts || 0) + 1;
      let lockoutUntil: Date | null = null;
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
        throw new UnauthorizedException('Too many failed login attempts. Account locked.');
      }
    }
    return null;
  }

  async login(user: Omit<User, 'hashed_password' | 'salt'>): Promise<JwtTokens> {
    const payload: JwtPayload = {
      email: user.email,
      sub: user.user_id,
      roles: user.roles,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.generateRefreshToken();
    const refreshTokenExpires = new Date(
      Date.now() + Number(this.configService.get('JWT_REFRESH_EXPIRATION_TIME', 7 * 24 * 60 * 60 * 1000))
    );

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

  async refreshToken(refreshToken: string): Promise<JwtTokens> {
    const user = await this.prisma.user.findFirst({ where: { refresh_token: refreshToken, is_deleted: false } });
    
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (user.refresh_token_expires && user.refresh_token_expires < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const payload: JwtPayload = {
      email: user.email,
      sub: user.user_id,
      roles: user.roles,
    };

    const accessToken = this.jwtService.sign(payload);
    const newRefreshToken = this.generateRefreshToken();
    const refreshTokenExpires = new Date(
      Date.now() + Number(this.configService.get('JWT_REFRESH_EXPIRATION_TIME', 7 * 24 * 60 * 60 * 1000))
    );

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

  async verifyEmail(token: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { verification_token: token, is_deleted: false } });
    
    if (!user) {
      throw new NotFoundException('Invalid verification token');
    }

    if (user.verification_token_expires && user.verification_token_expires < new Date()) {
      throw new BadRequestException('Verification token expired');
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

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email, is_deleted: false } });
    
    if (!user) {
      return;
    }

    const resetToken = this.generateToken();
    const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { user_id: user.user_id },
      data: {
        password_reset_token: resetToken,
        password_reset_expires: resetExpires,
      },
    });

    // Need to get the name for the email. If it's a clinician, use clinician.name. If patient, use patient.full_name.
    // For now, we'll just use the email.
    await sendPasswordResetEmail(user.email, user.email, resetToken); // Using email as name for now
  }

  async resetPassword(token: string, password: string, passwordConfirmation: string): Promise<void> {
    if (password !== passwordConfirmation) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.prisma.user.findUnique({ where: { password_reset_token: token, is_deleted: false } });
    
    if (!user) {
      throw new NotFoundException('Invalid reset token');
    }

    if (user.password_reset_expires && user.password_reset_expires < new Date()) {
      throw new BadRequestException('Reset token expired');
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

  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { user_id: userId },
      data: {
        refresh_token: null,
        refresh_token_expires: null,
      },
    });
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email, is_deleted: false } });
    
    if (!user) {
      return;
    }

    if (user.email_verified) {
      throw new BadRequestException('Email already verified');
    }

    const verificationToken = this.generateToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.prisma.user.update({
      where: { user_id: user.user_id },
      data: {
        verification_token: verificationToken,
        verification_token_expires: verificationExpires,
      },
    });

    // Need to get the name for the email. If it's a clinician, use clinician.name. If patient, use patient.full_name.
    // For now, we'll just use the email.
    await sendVerificationEmail(user.email, user.email, verificationToken); // Using email as name for now
  }

  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }
}
