import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' }); // Specify email as the username field
  }

  async validate(email: string, password: string): Promise<any> {
    // email parameter name here matches usernameField above
    const clinician = await this.authService.validateUser(email, password);
    if (!clinician) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return clinician; // This will be attached to req.user for the login route
  }
}
