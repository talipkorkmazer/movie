import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { UserModel, UserWithRolePermissions } from '@/auth/auth.model';
import { LoginSuccessResponseType } from '@auth/types/login-success-response.type';
import { RegisterDto } from '@auth/dto/register.dto';
import { RegisterSuccessResponseType } from '@auth/types/register-success-response.type';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

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

    return this.transformUserToUserModel(user);
  }

  transformUserToUserModel(user: UserWithRolePermissions): UserModel {
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

  async login(user: User): Promise<LoginSuccessResponseType> {
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

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: registerDto.username,
        password: hashedPassword,
        age: registerDto.age,
        roleId: registerDto.roleId,
      },
    });

    return { token: this.generateToken(user) };
  }

  private generateToken(user: User): string {
    return this.jwtService.sign({ id: user.id });
  }
}
