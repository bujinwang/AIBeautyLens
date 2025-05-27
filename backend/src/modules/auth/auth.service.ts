import { Injectable, ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { CliniciansService } from '../clinicians/clinicians.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma, Clinician } from '@prisma/client'; // Import Clinician directly
import { Role } from './enums/role.enum'; // Import Role enum
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { JwtTokens } from './interfaces/jwt-tokens.interface';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../common/services/email.service';

interface JwtPayload {
  email: string;
  sub: string; // clinician_id
  roles: string[];
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private cliniciansService: CliniciansService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // Expect a DTO-like structure with raw password, then construct ClinicianCreateInput
  async register(
    registrationData: Omit<Prisma.ClinicianCreateInput, 'hashed_password' | 'salt' | 'roles' | 'clinician_id' | 'created_at' | 'updated_at' | 'organization_id' | 'organization' | 'patientAssignments'> & { password: string }
  ): Promise<Omit<Clinician, 'hashed_password' | 'salt'>> {
    const existingClinician = await this.cliniciansService.findOneByEmail(registrationData.email);
    if (existingClinician) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(registrationData.password, salt);

    // Generate verification token
    const verificationToken = this.generateToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Construct the full Prisma.ClinicianCreateInput object
    const createInput: Prisma.ClinicianCreateInput = {
      email: registrationData.email,
      name: registrationData.name,
      specialty: registrationData.specialty,
      hashed_password: hashedPassword,
      salt: salt,
      roles: [Role.Clinician], // Default role
      verification_token: verificationToken,
      verification_token_expires: verificationExpires,
      email_verified: false,
    };

    const newClinician = await this.cliniciansService.create(createInput);

    // Send verification email using the new email service
    await sendVerificationEmail(newClinician.email, newClinician.name, verificationToken);

    return this.cliniciansService.excludePasswordFields(newClinician);
  }

  async validateUser(email: string, pass: string): Promise<Omit<Clinician, 'hashed_password' | 'salt'> | null> {
    const clinician = await this.cliniciansService.findOneByEmail(email);

    if (clinician && clinician.hashed_password && clinician.salt) {
      const isPasswordMatching = await bcrypt.compare(pass, clinician.hashed_password);
      if (isPasswordMatching) {
        return this.cliniciansService.excludePasswordFields(clinician);
      }
    }
    // For security, do not specify whether the email or password was incorrect
    return null;
  }

  async login(clinician: Omit<Clinician, 'hashed_password' | 'salt'>): Promise<JwtTokens> {
    // Create JWT payload
    const payload: JwtPayload = {
      email: clinician.email,
      sub: clinician.clinician_id,
      roles: clinician.roles,
    };

    // Generate tokens
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.generateRefreshToken();
    const refreshTokenExpires = new Date(
      Date.now() + Number(this.configService.get('JWT_REFRESH_EXPIRATION_TIME', 7 * 24 * 60 * 60 * 1000))
    );

    // Store refresh token in database
    await this.cliniciansService.update(clinician.clinician_id, {
      refresh_token: refreshToken,
      refresh_token_expires: refreshTokenExpires,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<JwtTokens> {
    // Find clinician by refresh token
    const clinician = await this.findClinicianByRefreshToken(refreshToken);
    
    if (!clinician) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token is expired
    if (clinician.refresh_token_expires && clinician.refresh_token_expires < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Generate new tokens
    const payload: JwtPayload = {
      email: clinician.email,
      sub: clinician.clinician_id,
      roles: clinician.roles,
    };

    const accessToken = this.jwtService.sign(payload);
    const newRefreshToken = this.generateRefreshToken();
    const refreshTokenExpires = new Date(
      Date.now() + Number(this.configService.get('JWT_REFRESH_EXPIRATION_TIME', 7 * 24 * 60 * 60 * 1000))
    );

    // Update refresh token in database
    await this.cliniciansService.update(clinician.clinician_id, {
      refresh_token: newRefreshToken,
      refresh_token_expires: refreshTokenExpires,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async verifyEmail(token: string): Promise<void> {
    // Find clinician by verification token
    const clinician = await this.findClinicianByVerificationToken(token);
    
    if (!clinician) {
      throw new NotFoundException('Invalid verification token');
    }

    // Check if token is expired
    if (clinician.verification_token_expires && clinician.verification_token_expires < new Date()) {
      throw new BadRequestException('Verification token expired');
    }

    // Mark email as verified
    await this.cliniciansService.update(clinician.clinician_id, {
      email_verified: true,
      verification_token: null,
      verification_token_expires: null,
    });
  }

  async requestPasswordReset(email: string): Promise<void> {
    // Find clinician by email
    const clinician = await this.cliniciansService.findOneByEmail(email);
    
    if (!clinician) {
      // Don't reveal if email exists or not
      return;
    }

    // Generate reset token
    const resetToken = this.generateToken();
    const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Store token in database
    await this.cliniciansService.update(clinician.clinician_id, {
      password_reset_token: resetToken,
      password_reset_expires: resetExpires,
    });

    // Send reset email using the new email service
    await sendPasswordResetEmail(clinician.email, clinician.name, resetToken);
  }

  async resetPassword(token: string, password: string, passwordConfirmation: string): Promise<void> {
    // Validate password match
    if (password !== passwordConfirmation) {
      throw new BadRequestException('Passwords do not match');
    }

    // Find clinician by reset token
    const clinician = await this.findClinicianByResetToken(token);
    
    if (!clinician) {
      throw new NotFoundException('Invalid reset token');
    }

    // Check if token is expired
    if (clinician.password_reset_expires && clinician.password_reset_expires < new Date()) {
      throw new BadRequestException('Reset token expired');
    }

    // Hash new password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password
    await this.cliniciansService.update(clinician.clinician_id, {
      hashed_password: hashedPassword,
      salt,
      password_reset_token: null,
      password_reset_expires: null,
      // Invalidate refresh token for security
      refresh_token: null,
      refresh_token_expires: null,
    });
  }

  async logout(clinicianId: string): Promise<void> {
    // Invalidate refresh token
    await this.cliniciansService.update(clinicianId, {
      refresh_token: null,
      refresh_token_expires: null,
    });
  }

  async resendVerificationEmail(email: string): Promise<void> {
    // Find clinician by email
    const clinician = await this.cliniciansService.findOneByEmail(email);
    
    if (!clinician) {
      // Don't reveal if email exists or not
      return;
    }

    // Check if already verified
    if (clinician.email_verified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate new verification token
    const verificationToken = this.generateToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update verification token
    await this.cliniciansService.update(clinician.clinician_id, {
      verification_token: verificationToken,
      verification_token_expires: verificationExpires,
    });

    // Send verification email using the new email service
    await sendVerificationEmail(clinician.email, clinician.name, verificationToken);
  }

  // Helper methods
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  private async findClinicianByVerificationToken(token: string): Promise<Clinician | null> {
    return this.cliniciansService.findOneByVerificationToken(token);
  }

  private async findClinicianByResetToken(token: string): Promise<Clinician | null> {
    return this.cliniciansService.findOneByResetToken(token);
  }

  private async findClinicianByRefreshToken(token: string): Promise<Clinician | null> {
    return this.cliniciansService.findOneByRefreshToken(token);
  }
}
