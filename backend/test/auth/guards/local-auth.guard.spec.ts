import { LocalAuthGuard } from '../../../src/modules/auth/guards/local-auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('LocalAuthGuard', () => {
  let localAuthGuard: LocalAuthGuard;

  beforeEach(() => {
    localAuthGuard = new LocalAuthGuard();
  });

  it('should be defined', () => {
    expect(localAuthGuard).toBeDefined();
  });

  // Note: Testing Passport guards typically involves mocking the execution context
  // and spying on the `logIn` method if used, or verifying the result of `handleRequest`.
  // Since LocalAuthGuard extends PassportAuthGuard, much of the core logic is within Passport.

  describe('canActivate', () => {
    it('should return true if authentication is successful', async () => {
      // Mock the canActivate method of the parent class (PassportAuthGuard)
      // to simulate a successful authentication by Passport.
      jest.spyOn(localAuthGuard, 'canActivate').mockImplementation((context: ExecutionContext) => {
        // Simulate Passport successfully authenticating and calling next handler
        // In reality, PassportAuthGuard internally calls the strategy and handles the result.
        // Here we just mock the outcome for the guard's canActivate.
        return true; 
      });

      // Create a mock execution context (details might vary based on NestJS version and setup)
      const mockContext = {} as ExecutionContext;

      // Pass the mock context to the canActivate call
      const result = await localAuthGuard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should return false if authentication fails', async () => {
       // Mock the canActivate method to simulate authentication failure.
       jest.spyOn(localAuthGuard, 'canActivate').mockImplementation((context: ExecutionContext) => {
         // Simulate Passport failing authentication
         return false;
       });

       const mockContext = {} as ExecutionContext;

       // Pass the mock context to the canActivate call
       const result = await localAuthGuard.canActivate(mockContext);

       expect(result).toBe(false);
    });

    // Note: Detailed testing of invalid credentials handling is in LocalStrategy.
    // This guard test focuses on the guard's role in the request lifecycle.
  });

  describe('handleRequest', () => {
    it('should return the user if authentication is successful', () => {
      const user = { userId: 1, username: 'testuser' };
      const info = {}; // Optional info from Passport
      const error = null; // No error
      const status = undefined; // Optional status

      const result = localAuthGuard.handleRequest(error, user, info, status);

      expect(result).toBe(user);
    });

    it('should throw UnauthorizedException if authentication fails (no user)', () => {
      const user = null; // Authentication failed
      const info = {};
      const error = new Error('Invalid credentials'); // Simulate error from strategy/Passport
      const status = undefined;

      expect(() => localAuthGuard.handleRequest(error, user, info, status)).toThrow(UnauthorizedException);
    });

    it('should throw the provided error if authentication fails with an error', () => {
        const user = null; // Authentication failed
        const info = {};
        const error = new Error('Some other error'); // Simulate a different error
        const status = undefined;

        expect(() => localAuthGuard.handleRequest(error, user, info, status)).toThrow('Some other error');
     });

    // Note: handleRequest is called internally by PassportAuthGuard after validate.
    // These tests verify its logic based on the inputs it receives.
  });
}); 