import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateRoleDto } from '@role/dto/create-role.dto';
import { UpdateRoleDto } from '@role/dto/update-role.dto';
import { RolesOutputDto } from '@role/dto/roles-output.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { createPaginator } from '@/common/pagination.helper';
import { PaginatedResult } from '@/common/types/paginated-result';
import { RoleOutputDto } from '@role/dto/role-output.dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<RolesOutputDto>> {
    const paginate = createPaginator(paginationDto);
    const include = {
      include: {
        Permissions: {
          include: {
            permission: true,
          },
        },
      },
    };
    const roles: PaginatedResult<Prisma.RoleGetPayload<typeof include>> =
      await paginate(this.prisma.role, include);

    // transform roles.data into RolesOutputDto
    const data = roles.data.map(role => ({
      ...role,
      Permissions: role.Permissions.map(permission => permission.permission),
    }));

    return {
      ...roles,
      data,
    };
  }

  async find(id: string): Promise<RolesOutputDto> {
    const role = await this.prisma.role.findFirst({
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

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return {
      ...role,
      Permissions: role.Permissions.map(permission => permission.permission),
    };
  }

  async create(createRoleDto: CreateRoleDto): Promise<RoleOutputDto> {
    const { name, permissionIds } = createRoleDto;
    // check of role already exists
    const roleExists = await this.prisma.role.count({
      where: {
        name,
      },
    });
    if (roleExists) {
      throw new ConflictException('Role already exists');
    }

    // Create the role first
    const role = await this.prisma.role.create({
      data: {
        name,
      },
    });

    // Assign permissions if permissionIds are provided
    if (permissionIds && permissionIds.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: permissionIds.map(permissionId => ({
          roleId: role.id,
          permissionId: permissionId,
        })),
        skipDuplicates: true,
      });
    }

    return role;
  }

  async update(
    id: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<RoleOutputDto> {
    const role = await this.prisma.role.update({
      where: {
        id: id,
      },
      data: updateRoleDto,
    });
    // check if permissionIds are provided
    if (updateRoleDto.permissionIds && updateRoleDto.permissionIds.length > 0) {
      // create or update permissions
      await this.prisma.rolePermission.createMany({
        data: updateRoleDto.permissionIds.map(permissionId => ({
          roleId: role.id,
          permissionId: permissionId,
        })),
        skipDuplicates: true,
      });
    }

    return role;
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.role.delete({
        where: { id },
      });
    } catch (e) {
      throw new NotFoundException('Role not found');
    }
  }
}
