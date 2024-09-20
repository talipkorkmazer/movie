import { BadRequestException, Injectable } from '@nestjs/common';
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
    const roles = await this.prisma.role.findMany({
      where: {
        name: {
          in: createPermissionDto.role,
        },
      },
    });
    if (roles.length === 0) {
      throw new BadRequestException('Role not found');
    }
    for (const role of roles) {
      delete createPermissionDto.role;
      const permission = await this.prisma.permission.upsert({
        where: {
          name: createPermissionDto.name,
          description: createPermissionDto.description,
        },
        create: createPermissionDto,
        update: createPermissionDto,
      });
      await this.prisma.role.update({
        where: {
          id: role.id,
        },
        data: {
          Permissions: {
            create: {
              permission: {
                connectOrCreate: {
                  where: {
                    id: permission.id,
                  },
                  create: permission,
                },
              },
            },
          },
        },
      });
    }
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    const roles = await this.prisma.role.findMany({
      where: {
        name: {
          in: updatePermissionDto.role,
        },
      },
    });
    if (roles.length === 0) {
      throw new BadRequestException('Role not found');
    }
    for (const role of roles) {
      delete updatePermissionDto.role;
      const permissionExists = await this.prisma.permission.findFirst({
        where: {
          id,
        },
        select: {
          id: true,
        },
      });

      if (!permissionExists) {
        throw new BadRequestException('Permission not found');
      }

      const permission = await this.prisma.permission.update({
        where: {
          id,
        },
        data: updatePermissionDto,
      });

      await this.prisma.role.update({
        where: {
          id: role.id,
        },
        data: {
          Permissions: {
            create: {
              permission: {
                connectOrCreate: {
                  where: {
                    id: permission.id,
                  },
                  create: permission,
                },
              },
            },
          },
        },
      });
    }
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
