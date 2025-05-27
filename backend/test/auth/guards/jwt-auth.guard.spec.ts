import { JwtAuthGuard } from '../../../src/modules/auth/guards/jwt-auth.guard';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;

  beforeEach(() => {
    jwtAuthGuard = new JwtAuthGuard();
  });

  it('should be defined', () => {
    expect(jwtAuthGuard).toBeDefined();
  });

  // Note: As with LocalAuthGuard, testing Passport guards often focuses on handleRequest
  // or mocking the underlying Passport behavior rather than canActivate directly.

  describe('handleRequest', () => {
    it('should return the user if JWT authentication is successful', () => {
      const user = { userId: 1, username: 'testuser', roles: ['Clinician'] }; // User object from JwtStrategy validate
      const info = {}; // Optional info from Passport
      const error = null; // No error
      const status = undefined; // Optional status

      const result = jwtAuthGuard.handleRequest(error, user, info, status);

      expect(result).toBe(user);
    });

    it('should throw UnauthorizedException if JWT authentication fails (no user)', () => {
      const user = null; // Authentication failed (e.g., invalid or expired JWT)
      const info = { message: 'Unauthorized' }; // Simulate info from Passport
      const error = new UnauthorizedException(); // Simulate error from strategy/Passport
      const status = undefined;

      expect(() => jwtAuthGuard.handleRequest(error, user, info, status)).toThrow(UnauthorizedException);
    });

    it('should throw the provided error if JWT authentication fails with a specific error', () => {
        const user = null; // Authentication failed
        const info = {};
        const error = new Error('Token expired'); // Simulate a different error
        const status = undefined;

        expect(() => jwtAuthGuard.handleRequest(error, user, info, status)).toThrow('Token expired');
     });

    // Note: Detailed testing of invalid JWTs is in JwtStrategy.
    // This guard test verifies its logic based on the inputs it receives from Passport.
  });
}); 