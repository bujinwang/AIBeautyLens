import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/modules/auth/auth.service';
import { CliniciansService } from '../src/modules/clinicians/clinicians.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma, Clinician } from '@prisma/client';

describe('AuthService', () => {
  let authService: AuthService;
  let cliniciansService: CliniciansService;
  let jwtService: JwtService;
  let prismaService: PrismaService;

  const mockCliniciansService = {
    findOneByEmail: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockPrismaService = {
    // Mock PrismaService methods if AuthService directly interacts with it (less likely with repository pattern)
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService as unknown as AuthService,
        },
        {
          provide: CliniciansService,
          useValue: mockCliniciansService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    cliniciansService = module.get<CliniciansService>(CliniciansService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a new clinician', async () => {
      const registrationData: Omit<Prisma.ClinicianCreateInput, 'hashed_password' | 'salt' | 'roles' | 'clinician_id' | 'created_at' | 'updated_at' | 'organization_id' | 'organization' | 'patientAssignments'> & { password: string } = { 
        email: 'new@example.com',
        password: 'password',
        name: 'New User',
      };
      const createdClinician = { id: 2, email: 'new@example.com' };

      // Mock that the clinician does not exist
      mockCliniciansService.findOneByEmail.mockResolvedValue(null);
      // Mock the creation of the clinician
      mockCliniciansService.create.mockResolvedValue(createdClinician);

      // Spy on bcrypt.hash to ensure it's called (optional, more of an implementation detail test)
      const bcryptHashSpy = jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as any);

      const result = await authService.register(registrationData);

      expect(mockCliniciansService.findOneByEmail).toHaveBeenCalledWith(registrationData.email);
      expect(bcryptHashSpy).toHaveBeenCalledWith(registrationData.password, 10); // Assuming saltRounds = 10
      // Check that create was called with the correct data, including the hashed password
      expect(mockCliniciansService.create).toHaveBeenCalledWith(expect.objectContaining({
        email: registrationData.email,
        name: registrationData.name,
        hashed_password: 'hashedPassword',
      }));
      expect(result).toBe(createdClinician);
    });

    it('should throw an error if clinician email already exists', async () => {
      const registrationData: Omit<Prisma.ClinicianCreateInput, 'hashed_password' | 'salt' | 'roles' | 'clinician_id' | 'created_at' | 'updated_at' | 'organization_id' | 'organization' | 'patientAssignments'> & { password: string } = { 
        email: 'existing@example.com',
        password: 'password',
        name: 'Existing User',
      };

      // Mock that the clinician already exists
      mockCliniciansService.findOneByEmail.mockResolvedValue({ id: 1, email: 'existing@example.com' });

      await expect(authService.register(registrationData)).rejects.toThrow('Clinician with this email already exists');
      expect(mockCliniciansService.findOneByEmail).toHaveBeenCalledWith(registrationData.email);
      // Ensure that the create method was not called
      expect(mockCliniciansService.create).not.toHaveBeenCalled();
    });

    // Add more test cases for invalid input (handled by DTO validation, but can test service logic) etc.
  });

  describe('login', () => {
    it('should return a JWT on successful login', async () => {
      const user = { id: 1, email: 'test@example.com' };
      const expectedToken = 'mock_jwt_token';

      // Mock jwtService.sign to return a mock token
      mockJwtService.sign.mockReturnValue(expectedToken);

      const result = await authService.login(user as any);

      // Verify that jwtService.sign was called with the correct payload
      expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: user.id, email: user.email });
      expect(result).toEqual({ access_token: expectedToken });
    });

    // Note: The actual validation of credentials for login is handled by LocalStrategy.
    // AuthService.login just generates the JWT after successful validation.
    // Test cases for invalid credentials should be in LocalStrategy tests.
  });

  // Add tests for validateUser, validateJwt, etc. (depending on AuthService implementation)
}); 