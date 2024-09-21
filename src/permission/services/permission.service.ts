import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreatePermissionDto } from '@permission/dto/create-permission.dto';
import { UpdatePermissionDto } from '@permission/dto/update-permission.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { createPaginator } from '@/common/pagination.helper';
import { PaginatedResult } from '@/common/types/paginated-result';
import { PermissionOutputDto } from '@permission/dto/permission-output.dto';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<PermissionOutputDto>> {
    const paginate = createPaginator(paginationDto);

    return paginate(this.prisma.permission);
  }

  async find(id: string): Promise<PermissionOutputDto> {
    const permission = this.prisma.permission.findFirst({
      where: {
        id: id,
      },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }

  async create(
    createPermissionDto: CreatePermissionDto,
  ): Promise<PermissionOutputDto> {
    const permissionExists = await this.prisma.permission.count({
      where: {
        name: createPermissionDto.name,
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
  ): Promise<PermissionOutputDto> {
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

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.permission.delete({
        where: { id },
      });
    } catch (e) {
      throw new NotFoundException('Permission not found');
    }
  }
}
