import { Controller, Post, Body, UseGuards, Get, HttpCode, HttpStatus, Request as NestRequest } from '@nestjs/common';
import { Request } from 'express'; // This is the Express Request type
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard'; // Import RolesGuard
import { Roles } from './decorators/roles.decorator'; // Import Roles decorator
import { Role } from './enums/role.enum'; // Import Role enum
import { RegisterClinicianDto } from './dto/register-clinician.dto';
import { LoginDto } from './dto/login.dto';
import { Clinician } from '@prisma/client'; // Import Clinician type for req.user

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK) // Explicitly set OK status for login
  async login(@Body() loginDto: LoginDto, @NestRequest() req: Request & { user: Omit<Clinician, 'hashed_password' | 'salt'> }) {
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
}
