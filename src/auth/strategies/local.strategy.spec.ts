import { LocalStrategy } from '@auth/strategies/local.strategy';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '@auth/services/auth.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(), // Mock validateUser method in AuthService
          },
        },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  describe('validate', () => {
    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const username = 'invalidUser';
      const password = 'invalidPass';

      // Mocking validateUser to return null, simulating invalid credentials
      (authService.validateUser as jest.Mock).mockResolvedValue(null);

      // Expect UnauthorizedException to be thrown
      await expect(strategy.validate(username, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return the user if credentials are valid', async () => {
      const username = 'validUser';
      const password = 'validPass';
      const user = {
        id: '1',
        username: 'validUser',
        age: 30,
        Role: { name: 'CUSTOMER', Permissions: [] },
      };

      // Mocking validateUser to return a valid user
      (authService.validateUser as jest.Mock).mockResolvedValue(user);

      // Expect the valid user to be returned
      const result = await strategy.validate(username, password);
      expect(result).toEqual(user);
    });
  });
});
