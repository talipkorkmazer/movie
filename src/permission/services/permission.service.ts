import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Permission } from '@prisma/client';
import { CreatePermissionDto } from '@permission/dto/create-permission.dto';
import { UpdatePermissionDto } from '@permission/dto/update-permission.dto';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Permission[]> {
    return this.prisma.permission.findMany({
      include: {
        Roles: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async find(id: string): Promise<Permission> {
    return this.prisma.permission.findFirst({
      where: {
        id: id,
      },
      include: {
        Roles: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async create(createPermissionDto: CreatePermissionDto) {
    const permissionExists = await this.prisma.permission.findFirst({
      where: {
        name: createPermissionDto.name,
      },
      select: {
        id: true,
      },
    });
    if (permissionExists) {
      throw new ConflictException('Permission already exists');
    }

    const permission = await this.prisma.permission.create({
      data: createPermissionDto,
    });

    if (createPermissionDto.roleIds && createPermissionDto.roleIds.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: createPermissionDto.roleIds.map(roleId => ({
          roleId: roleId,
          permissionId: permission.id,
        })),
        skipDuplicates: true,
      });
    }

    return permission;
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    const permission = await this.prisma.permission.update({
      where: {
        id: id,
      },
      data: updatePermissionDto,
    });
    // check if permissionIds are provided
    if (updatePermissionDto.roleIds && updatePermissionDto.roleIds.length > 0) {
      // create or update permissions
      await this.prisma.rolePermission.createMany({
        data: updatePermissionDto.roleIds.map(roleId => ({
          roleId: roleId,
          permissionId: permission.id,
        })),
        skipDuplicates: true,
      });
    }

    return permission;
  }

  async remove(id: string) {
    try {
      return await this.prisma.permission.delete({
        where: { id },
      });
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
