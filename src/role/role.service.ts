import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Role } from '@prisma/client';
import { CreateRoleDto } from '@role/dto/create-role.dto';
import { UpdateRoleDto } from '@role/dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(
    private prisma: PrismaService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.prisma.role.findMany({
      include: {
        Permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async find(id: string): Promise<Role> {
    return this.prisma.role.findFirst({
      where: {
        id: id,
      },
      include: {
        Permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    return this.prisma.role.upsert({
      where: {
        name: createRoleDto.name,
      },
      create: createRoleDto,
      update: createRoleDto,
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    return this.prisma.role.update({
      where: {
        id: id,
      },
      data: updateRoleDto,
    });
  }

  async remove(id: string): Promise<Role> {
    try {
      return await this.prisma.role.delete({
        where: { id },
      });
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
