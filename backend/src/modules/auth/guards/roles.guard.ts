import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Clinician } from '@prisma/client'; // Assuming the user object attached by JwtStrategy is of type Clinician

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles specified, access granted
    }

    const { user } = context.switchToHttp().getRequest();

    // Ensure user object and user.roles exist
    // The user object is attached by the JwtStrategy after successful token validation
    // It should include the roles as signed in the JWT payload
    if (!user || !user.roles) {
      return false; // User not found or roles not present in token/user object
    }

    // Check if the user has at least one of the required roles
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}