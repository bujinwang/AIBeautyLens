import { LocalStrategy } from '../../../src/modules/auth/strategies/local.strategy';
import { AuthService } from '../../../src/modules/auth/auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('LocalStrategy', () => {
  let localStrategy: LocalStrategy;
  let authService: AuthService;

  const mockAuthService = {
    validateUser: jest.fn(),
  };

  beforeEach(() => {
    authService = mockAuthService as any; // Cast mock to AuthService type
    localStrategy = new LocalStrategy(authService);
  });

  it('should be defined', () => {
    expect(localStrategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return the user if validation is successful', async () => {
      const user = { userId: 1, username: 'testuser' };
      mockAuthService.validateUser.mockResolvedValue(user);

      const result = await localStrategy.validate('test@example.com', 'password');

      expect(mockAuthService.validateUser).toHaveBeenCalledWith('test@example.com', 'password');
      expect(result).toBe(user);
    });

    it('should throw UnauthorizedException if validation fails', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(localStrategy.validate('test@example.com', 'wrongpassword')).rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
    });

    // Add more test cases for invalid email/password formats if validation is handled by the strategy
  });
}); 