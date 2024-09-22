import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return login success response', async () => {
      const req = { user: { id: 'user1', username: 'testuser' } };
      const result = { token: 'token' };
      jest.spyOn(authService, 'login').mockImplementation(async () => result);

      expect(await authController.login(req)).toBe(result);
    });
  });

  describe('register', () => {
    it('should return register success response', async () => {
      const registerDto: RegisterDto = {
        username: 'testuser',
        password: 'password',
        age: 25,
        roleId: 'a772a638-7dcb-41b5-9de3-6e127af7b81a',
      };
      const result = { token: 'token' };
      jest
        .spyOn(authService, 'register')
        .mockImplementation(async () => result);

      expect(await authController.register(registerDto)).toBe(result);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', () => {
      const req = { user: { id: 'user1', username: 'testuser' } };
      expect(authController.getProfile(req)).toBe(req.user);
    });
  });
});
