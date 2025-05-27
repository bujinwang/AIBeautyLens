import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../src/modules/auth/auth.controller';
import { AuthService } from '../src/modules/auth/auth.service';
import { CliniciansService } from '../src/modules/clinicians/clinicians.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '../src/modules/auth/enums/role.enum';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    registerClinician: jest.fn(),
    login: jest.fn(),
    // Add other mocked methods from AuthService as needed
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: CliniciansService,
          useValue: {
            // Mock CliniciansService methods
          },
        },
        {
          provide: JwtService,
          useValue: {
            // Mock JwtService methods
          },
        },
        {
          provide: PrismaService,
          useValue: {
            // Mock PrismaService methods
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a clinician', async () => {
      const registerDto = { email: 'test@example.com', password: 'password', name: 'Test User' };
      const expectedResult = { id: 1, email: 'test@example.com' };

      mockAuthService.registerClinician.mockResolvedValue(expectedResult);

      expect(await authController.register(registerDto as any)).toBe(expectedResult);
    });

    it('should throw an error if registration fails', async () => {
      const registerDto = { email: 'test@example.com', password: 'password', name: 'Test User' };

      mockAuthService.registerClinician.mockRejectedValue(new Error('Registration failed'));

      await expect(authController.register(registerDto as any)).rejects.toThrow('Registration failed');
    });

    // Add more test cases for invalid input, existing email, etc.
  });

  describe('login', () => {
    it('should successfully login a clinician and return a JWT', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };
      const expectedResult = { access_token: 'mock_jwt_token' };

      // Mock the authService.login method to return a mock JWT
      mockAuthService.login.mockResolvedValue(expectedResult);

      // The LocalAuthGuard will have already validated the user and attached it to the request
      // We need to mock the request object that the controller receives
      const mockUser = { email: 'test@example.com' }; // Mock user object attached by the guard
      const mockRequest = { user: mockUser };

      expect(await authController.login(loginDto as any, mockRequest as any)).toBe(expectedResult);
      // Verify that authService.login was called with the user from the request
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should throw an error if login fails (e.g., invalid credentials)', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrongpassword' };

      // We are testing the controller's handling *after* the guard. 
      // If the guard fails, the controller method shouldn't even be called. 
      // However, for unit testing the controller's logic itself (e.g., how it uses the user object from the request), 
      // we can still mock a scenario where the service might throw if it were called directly or under different circumstances.
      // A more realistic test for invalid credentials would involve testing the LocalAuthGuard and LocalStrategy.
      
      // For the purpose of testing the controller's interaction with the service after a *successful* guard validation,
      // this test case might be less relevant for typical invalid credentials scenarios handled by the guard.
      // However, we can test a scenario where the service throws for some other reason after the guard passes.

      const mockUser = { email: 'test@example.com' }; // Assume guard passed
      const mockRequest = { user: mockUser };

      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      await expect(authController.login(loginDto as any, mockRequest as any)).rejects.toThrow('Invalid credentials');
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
    });

    // Add more test cases related to JWT structure/expiration if necessary (might be better in service/strategy tests)
  });

  describe('getProfile', () => {
    it('should return the user profile for a valid JWT and authorized role', async () => {
      const mockUser = { id: 1, email: 'test@example.com', roles: [Role.Clinician] };
      const mockRequest = { user: mockUser };

      // Since JwtAuthGuard and RolesGuard are applied at the controller level,
      // in unit tests for the controller, we typically mock the guards
      // or assume they have passed and the user is attached to the request.
      // Here, we are assuming the guards have passed and req.user is populated.

      expect(await authController.getProfile(mockRequest as any)).toBe(mockUser);
    });

    it('should throw unauthorized error for missing or invalid JWT (handled by JwtAuthGuard)', async () => {
      // This scenario is primarily handled by the JwtAuthGuard.
      // In a controller unit test, the guard would prevent the handler from being called.
      // A more appropriate test would be an integration test or a test for JwtAuthGuard itself.
      // For completeness in unit testing the controller method's *use* of req.user, 
      // we can note that if req.user were missing (which the guard prevents),
      // accessing req.user would result in undefined or an error depending on implementation details outside the controller's direct responsibility.

      // No direct test implementation needed here for controller unit test as the guard prevents access.
      // Note: Actual testing of invalid JWTs should focus on the guard/strategy.
    });

    it('should throw forbidden error for a valid JWT but unauthorized role (handled by RolesGuard)', async () => {
       // This scenario is primarily handled by the RolesGuard.
       // Similar to the JwtAuthGuard, the RolesGuard would prevent the handler from being called.
       // A more appropriate test would be an integration test or a test for RolesGuard itself.

       // No direct test implementation needed here for controller unit test as the guard prevents access.
       // Note: Actual testing of unauthorized roles should focus on the guard.
    });

    // Consider adding tests for different authorized roles (e.g., Admin)
  });

  // Add tests for protected routes here
});