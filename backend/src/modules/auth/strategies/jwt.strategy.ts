import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { CliniciansService } from '../../clinicians/clinicians.service'; // Import CliniciansService
import { Clinician } from '@prisma/client'; // Import Clinician type

// Define the expected shape of the JWT payload
interface JwtPayload {
  email: string;
  sub: string; // This will be clinician_id
  roles: string[];
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private cliniciansService: CliniciansService, // Inject CliniciansService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<Omit<Clinician, 'hashed_password' | 'salt'>> {
    // payload.sub should contain the clinician_id
    const clinician = await this.cliniciansService.findOneById(payload.sub);
    if (!clinician) {
      throw new UnauthorizedException('User not found or invalid token.');
    }
    // Optionally, you might want to check if the user is active or not banned, etc.

    // Return the clinician object, excluding sensitive fields.
    // This object will be attached to the request as `req.user`.
    // Also include roles from the payload, as they were signed into the token.
    const safeClinician = this.cliniciansService.excludePasswordFields(clinician);
    return { ...safeClinician, roles: payload.roles }; // Ensure roles from token are passed through
  }
}
