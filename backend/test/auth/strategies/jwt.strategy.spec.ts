import { JwtStrategy } from '../../../src/modules/auth/strategies/jwt.strategy';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CliniciansService } from '../../../src/modules/clinicians/clinicians.service';
import { Clinician } from '@prisma/client';
import { Role } from '../../../src/modules/auth/enums/role.enum';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let mockCliniciansService: any; // Use any for easier mocking

  beforeEach(() => {
    // Mock ConfigService and CliniciansService
    const mockConfigService = {
      get: jest.fn().mockReturnValue('mock_jwt_secret'), // Mock the JWT secret
    };
    mockCliniciansService = {
      findOneById: jest.fn(),
      excludePasswordFields: jest.fn(user => { // Mock utility function
         const { hashed_password, salt, ...safeUser } = user;
         return safeUser;
      }),
    };

    // Instantiate JwtStrategy with mocks
    jwtStrategy = new JwtStrategy(mockConfigService as any, mockCliniciansService as any);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return the user if validation is successful and user is found', async () => {
      // Payload should match the JwtPayload interface (sub is string)
      const payload = { sub: 'clinician_id_1', email: 'test@example.com', roles: [Role.Clinician] };
      
      // Mock the clinician object returned by findOneById
      const mockClinician = { 
        clinician_id: 'clinician_id_1', 
        email: 'test@example.com', 
        hashed_password: 'hashed', 
        salt: 'salt', 
        roles: [Role.Clinician] 
      } as Clinician;

      mockCliniciansService.findOneById.mockResolvedValue(mockClinician);

      const result = await jwtStrategy.validate(payload as any);

      expect(mockCliniciansService.findOneById).toHaveBeenCalledWith(payload.sub);
      // The result should be the safe user object returned by excludePasswordFields plus roles
      expect(result).toEqual({ 
        clinician_id: 'clinician_id_1', 
        email: 'test@example.com', 
        roles: [Role.Clinician] 
      });
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const payload = { sub: 'non_existent_id', email: 'test@example.com', roles: [Role.Clinician] };
      
      // Mock findOneById to return null (user not found)
      mockCliniciansService.findOneById.mockResolvedValue(null);

      await expect(jwtStrategy.validate(payload as any)).rejects.toThrow(UnauthorizedException);
      expect(mockCliniciansService.findOneById).toHaveBeenCalledWith(payload.sub);
    });

    // Note: Invalid token scenarios (expired, wrong signature, etc.) are typically handled
    // by the underlying passport-jwt library before the validate method is called.
    // Testing those would require mocking passport-jwt internals or using integration tests.
  });
}); 