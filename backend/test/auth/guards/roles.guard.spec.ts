import { RolesGuard } from '../../../src/modules/auth/guards/roles.guard';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../../src/modules/auth/enums/role.enum';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    rolesGuard = new RolesGuard(reflector);
  });

  it('should be defined', () => {
    expect(rolesGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if the user has at least one required role', () => {
      // Mock the getHandler and getClass methods of Reflector
      jest.spyOn(reflector, 'get')
        .mockReturnValueOnce([Role.Admin, Role.Clinician]); // Required roles

      // Create a mock execution context with a user having one of the required roles
      const mockContext = {
        getHandler: () => ({}), // Mock getHandler
        getClass: () => ({}), // Mock getClass
        switchToHttp: () => ({
          getRequest: () => ({
            user: { roles: [Role.Clinician] }, // User with Clinician role
          }),
        }),
      } as ExecutionContext;

      const result = rolesGuard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(reflector.get).toHaveBeenCalledWith('roles', expect.any(Object));
      expect(reflector.get).toHaveBeenCalledTimes(2); // Called for handler and class
    });

    it('should return false if the user does not have any of the required roles', () => {
        // Mock the getHandler and getClass methods of Reflector
        jest.spyOn(reflector, 'get')
          .mockReturnValueOnce([Role.Admin]); // Required role

        // Create a mock execution context with a user having a different role
        const mockContext = {
          getHandler: () => ({}), // Mock getHandler
          getClass: () => ({}), // Mock getClass
          switchToHttp: () => ({
            getRequest: () => ({
              user: { roles: [Role.Clinician] }, // User with Clinician role
            }),
          }),
        } as ExecutionContext;
  
        const result = rolesGuard.canActivate(mockContext);
  
        expect(result).toBe(false);
        expect(reflector.get).toHaveBeenCalledWith('roles', expect.any(Object));
        expect(reflector.get).toHaveBeenCalledTimes(2); // Called for handler and class
      });

      it('should return true if no roles are required', () => {
        // Mock Reflector to return undefined or an empty array for roles
        jest.spyOn(reflector, 'get')
          .mockReturnValueOnce(undefined) // No roles required on handler
          .mockReturnValueOnce(undefined); // No roles required on class

        const mockContext = {
            getHandler: () => ({}), 
            getClass: () => ({}), 
            switchToHttp: () => ({
              getRequest: () => ({
                user: { roles: [Role.Clinician] }, // User with any role
              }),
            }),
          } as ExecutionContext;

        const result = rolesGuard.canActivate(mockContext);

        expect(result).toBe(true);
        expect(reflector.get).toHaveBeenCalledWith('roles', expect.any(Object));
        expect(reflector.get).toHaveBeenCalledTimes(2);
      });

      it('should return false if user object or roles are missing', () => {
        // Mock Reflector to return required roles
        jest.spyOn(reflector, 'get')
          .mockReturnValueOnce([Role.Admin]); 
        
        // Mock context with missing user object
        const mockContextMissingUser = {
            getHandler: () => ({}), 
            getClass: () => ({}), 
            switchToHttp: () => ({
              getRequest: () => ({}), // No user object
            }),
          } as ExecutionContext;

        expect(rolesGuard.canActivate(mockContextMissingUser)).toBe(false);
        
        // Mock context with user object but missing roles array
        const mockContextMissingRoles = {
            getHandler: () => ({}), 
            getClass: () => ({}), 
            switchToHttp: () => ({
              getRequest: () => ({
                user: {} // User object without roles
              }),
            }),
          } as ExecutionContext;

        expect(rolesGuard.canActivate(mockContextMissingRoles)).toBe(false);
      });
  });
}); 