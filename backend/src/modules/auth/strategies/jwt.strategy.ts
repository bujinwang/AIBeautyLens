import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { CliniciansService } from '../../clinicians/clinicians.service'; // Import CliniciansService
import { User } from '@prisma/client'; // Import User type
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { Role } from '../enums/role.enum';
import { PrismaService } from '../../../prisma/prisma.service'; // Corrected Import PrismaService

// Define the expected shape of the JWT payload
interface JwtPayload {
  email: string;
  sub: string; // This will be user_id
  roles: Role[]; // Changed from string[] to Role[] for type safety
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService, // Inject PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    // payload.sub should contain the user_id
    const user = await this.prisma.user.findUnique({ where: { user_id: payload.sub, is_deleted: false } });
    if (!user) {
      throw new UnauthorizedException('User not found or invalid token.');
    }
    // Optionally, you might want to check if the user is active or not banned, etc.

    // This object will be attached to the request as `req.user`.
    return {
      userId: user.user_id,
      email: user.email,
      roles: payload.roles, // Roles from the token payload
    };
  }
}
