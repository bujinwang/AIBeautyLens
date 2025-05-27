import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { CliniciansService } from '../clinicians/clinicians.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma, Clinician } from '@prisma/client'; // Import Clinician directly
import { Role } from './enums/role.enum'; // Import Role enum

@Injectable()
export class AuthService {
  constructor(
    private cliniciansService: CliniciansService,
    private jwtService: JwtService,
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

    // Construct the full Prisma.ClinicianCreateInput object
    const createInput: Prisma.ClinicianCreateInput = {
      email: registrationData.email,
      name: registrationData.name,
      specialty: registrationData.specialty, // Make sure DTO provides this or handle if optional
      hashed_password: hashedPassword,
      salt: salt,
      roles: [Role.Clinician], // Default role
      // organization_id can be set if provided and logic is added
    };

    const newClinician = await this.cliniciansService.create(createInput);

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
    // throw new UnauthorizedException('Invalid credentials'); // Or return null and let controller handle
    return null;
  }

  async login(clinician: Omit<Clinician, 'hashed_password' | 'salt'>) {
    const payload = {
      email: clinician.email,
      sub: clinician.clinician_id, // Use clinician_id from Prisma model
      roles: clinician.roles,    // Include roles in the JWT payload
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
