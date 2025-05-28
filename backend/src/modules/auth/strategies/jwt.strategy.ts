import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { CliniciansService } from '../../clinicians/clinicians.service'; // Import CliniciansService
import { Clinician } from '@prisma/client'; // Import Clinician type
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { Role } from '../enums/role.enum';

// Define the expected shape of the JWT payload
interface JwtPayload {
  email: string;
  sub: string; // This will be clinician_id
  roles: Role[]; // Changed from string[] to Role[] for type safety
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

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    // payload.sub should contain the clinician_id
    const clinician = await this.cliniciansService.findOneById(payload.sub);
    if (!clinician) {
      throw new UnauthorizedException('User not found or invalid token.');
    }
    // Optionally, you might want to check if the user is active or not banned, etc.

    // This object will be attached to the request as `req.user`.
    return {
      userId: clinician.clinician_id, // payload.sub is clinician.clinician_id
      email: clinician.email, // payload.email is clinician.email
      roles: payload.roles, // Roles from the token payload
    };
  }
}
