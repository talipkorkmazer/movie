import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConflictException } from '@nestjs/common';
import { UserModel } from '@auth/models/auth.model';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            role: {
              findFirst: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return null if user is not found', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.validateUser('testuser', 'testpass');
      expect(result).toBeNull();
    });

    it('should return null if the password does not match', async () => {
      const user = {
        id: '1',
        username: 'testuser',
        password: 'hashedpass',
        age: 30,
        Role: {
          name: 'USER',
          Permissions: [],
        },
      };
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const result = await service.validateUser('testuser', 'wrongpass');
      expect(result).toBeNull();
    });

    it('should return the UserModel if the user is valid', async () => {
      const user = {
        id: '1',
        username: 'testuser',
        password: 'hashedpass',
        age: 30,
        Role: {
          name: 'USER',
          Permissions: [{ permission: { name: 'PERMISSION_NAME' } }],
        },
      };
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validateUser('testuser', 'testpass');
      expect(result).toEqual({
        id: '1',
        username: 'testuser',
        age: 30,
        Role: {
          name: 'USER',
          Permissions: ['PERMISSION_NAME'],
        },
      });
    });
  });

  describe('register', () => {
    it('should throw ConflictException if username already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        username: 'testuser',
      });

      const registerDto = {
        username: 'testuser',
        password: 'testpass',
        age: 25,
        roleId: 'role-id',
      };

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should successfully register a new user and return a token', async () => {
      const registerDto = {
        username: 'newuser',
        password: 'newpass',
        age: 25,
        roleId: 'role-id',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.role.findFirst as jest.Mock).mockResolvedValue({ id: 'role-id' });
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpass' as never);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: '1',
        username: 'newuser',
        password: 'hashedpass',
        age: 25,
        Role: { name: 'CUSTOMER', Permissions: [] },
      });
      (jwtService.sign as jest.Mock).mockReturnValue('token');

      const result = await service.register(registerDto);
      expect(result).toEqual({ token: 'token' });
    });
  });

  describe('login', () => {
    it('should return a valid token when login is successful', async () => {
      const user: UserModel = {
        id: '1',
        username: 'testuser',
        age: 30,
        Role: {
          name: 'CUSTOMER',
          Permissions: [],
        },
      };

      (jwtService.sign as jest.Mock).mockReturnValue('valid-jwt-token');

      const result = await service.login(user);
      expect(result).toEqual({ token: 'valid-jwt-token' });
      expect(jwtService.sign).toHaveBeenCalledWith(user);
    });
  });
});
