import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import {
  PREDEFINED_ROLES,
  UserModel,
  UserWithRolePermissions,
} from '@auth/models/auth.model';
import { LoginSuccessResponseType } from '@auth/types/login-success-response.type';
import { RegisterDto } from '@auth/dto/register.dto';
import { RegisterSuccessResponseType } from '@auth/types/register-success-response.type';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  static transformUserToUserModel(user: UserWithRolePermissions): UserModel {
    return {
      id: user.id,
      username: user.username,
      age: user.age,
      Role: {
        name: user.Role.name,
        Permissions: user.Role.Permissions.map(
          permission => permission.permission.name,
        ),
      },
    };
  }

  async validateUser(
    username: string,
    password: string,
  ): Promise<UserModel | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        username: username,
      },
      select: {
        id: true,
        username: true,
        password: true,
        age: true,
        Role: {
          select: {
            name: true,
            Permissions: {
              select: {
                permission: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Return null if user not found in database
    if (!user) {
      return null;
    }

    // Return null if password is invalid
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return null;
    }

    return AuthService.transformUserToUserModel(user);
  }

  async login(user: UserModel): Promise<LoginSuccessResponseType> {
    return { token: this.generateToken(user) };
  }

  async register(
    registerDto: RegisterDto,
  ): Promise<RegisterSuccessResponseType | ConflictException> {
    if (
      await this.prisma.user.findUnique({
        where: { username: registerDto.username },
      })
    ) {
      throw new ConflictException('Username already exists');
    }

    const role: Pick<Role, 'id'> = await this.prisma.role.findFirst({
      where: {
        OR: [{ id: registerDto.roleId }, { name: PREDEFINED_ROLES.CUSTOMER }],
      },
      select: {
        id: true,
      },
    });

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: registerDto.username,
        password: hashedPassword,
        age: registerDto.age,
        roleId: role.id,
      },
      select: {
        id: true,
        username: true,
        password: true,
        age: true,
        Role: {
          select: {
            name: true,
            Permissions: {
              select: {
                permission: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    const userModel = AuthService.transformUserToUserModel(user);
    return { token: this.generateToken(userModel) };
  }

  private generateToken(user: UserModel): string {
    return this.jwtService.sign(user);
  }
}
