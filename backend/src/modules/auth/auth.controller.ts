import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Get, 
  HttpCode, 
  HttpStatus, 
  Request as NestRequest,
  Param,
  UnauthorizedException
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express'; // This is the Express Request type
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard'; // Import RolesGuard
import { Roles } from './decorators/roles.decorator'; // Import Roles decorator
import { Role } from './enums/role.enum'; // Import Role enum
import { RegisterClinicianDto } from './dto/register-clinician.dto';
import { LoginDto } from './dto/login.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtTokens } from './interfaces/jwt-tokens.interface';
import { Clinician } from '@prisma/client'; // Import Clinician type for req.user

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerClinicianDto: RegisterClinicianDto) {
    // AuthService.register now expects an object matching Prisma.ClinicianCreateInput structure
    // We need to map RegisterClinicianDto to this.
    // The password will be hashed in the service.
    // Roles will be defaulted in the service for now.
    return this.authService.register({
      email: registerClinicianDto.email,
      name: registerClinicianDto.name,
      password: registerClinicianDto.password, // Pass the raw password
      specialty: registerClinicianDto.specialty,
      // roles: [Role.Clinician] // Default role is set in AuthService
    });
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK) // Explicitly set OK status for login
  async login(@Body() loginDto: LoginDto, @NestRequest() req: Request & { user: Omit<Clinician, 'hashed_password' | 'salt'> }): Promise<JwtTokens> {
    // LocalAuthGuard populates req.user after successful validation by LocalStrategy
    // LoginDto is used by class-validator for the request body, but LocalStrategy handles the actual validation logic
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard) // Apply RolesGuard after JwtAuthGuard
  @Roles(Role.Clinician, Role.Admin) // Only users with Clinician or Admin role can access
  @Get('profile')
  getProfile(@NestRequest() req: Request) {
    return req.user; // req.user is populated by JwtStrategy
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<JwtTokens> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    await this.authService.verifyEmail(verifyEmailDto.token);
    return { message: 'Email successfully verified' };
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() requestPasswordResetDto: RequestPasswordResetDto) {
    await this.authService.requestPasswordReset(requestPasswordResetDto.email);
    return { message: 'If your email is registered, you will receive a password reset link' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
      resetPasswordDto.passwordConfirmation
    );
    return { message: 'Password successfully reset' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@NestRequest() req: Request) {
    const clinicianId = req.user['sub'] || (req.user as any).clinician_id;
    
    if (!clinicianId) {
      throw new UnauthorizedException('Invalid user information');
    }
    
    await this.authService.logout(clinicianId);
    return { message: 'Successfully logged out' };
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() requestVerificationDto: RequestPasswordResetDto) {
    await this.authService.resendVerificationEmail(requestVerificationDto.email);
    return { message: 'If your email is registered and not verified, you will receive a verification link' };
  }
}
