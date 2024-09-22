import { Test, TestingModule } from '@nestjs/testing';
import { PermissionService } from '@permission/services/permission.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreatePermissionDto } from '@permission/dto/create-permission.dto';
import { UpdatePermissionDto } from '@permission/dto/update-permission.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { createPaginator } from '@/common/pagination.helper';

jest.mock('@/common/pagination.helper', () => ({
  createPaginator: jest.fn(() => jest.fn()), // Mock pagination helper
}));

describe('PermissionService', () => {
  let service: PermissionService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        {
          provide: PrismaService,
          useValue: {
            permission: {
              findFirst: jest.fn(),
              count: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            rolePermission: {
              createMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mock call history after each test
  });

  describe('findAll', () => {
    it('should return a paginated result of permissions', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const paginatedResult = { data: [{ id: '1', name: 'Permission 1' }] };
      const paginate = jest.fn().mockResolvedValue(paginatedResult);

      (createPaginator as jest.Mock).mockReturnValue(paginate);

      const result = await service.findAll(paginationDto);

      expect(createPaginator).toHaveBeenCalledWith(paginationDto);
      expect(paginate).toHaveBeenCalledWith(prisma.permission);
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('find', () => {
    it('should return a permission by ID', async () => {
      const permission = { id: '1', name: 'Permission 1' };

      (prisma.permission.findFirst as jest.Mock).mockResolvedValue(permission);

      const result = await service.find('1');
      expect(result).toEqual(permission);
      expect(prisma.permission.findFirst).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if permission is not found', async () => {
      (prisma.permission.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.find('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create and return a new permission with roles', async () => {
      const createPermissionDto: CreatePermissionDto = {
        name: 'New Permission',
        description: 'New Permission Description',
        roleIds: ['role1', 'role2'],
      };
      const createdPermission = { id: '1', name: 'New Permission' };

      (prisma.permission.count as jest.Mock).mockResolvedValue(0); // No existing permission
      (prisma.permission.create as jest.Mock).mockResolvedValue(
        createdPermission,
      );
      (prisma.rolePermission.createMany as jest.Mock).mockResolvedValue({
        count: 2,
      });

      const result = await service.create(createPermissionDto);
      expect(result).toEqual(createdPermission);
      expect(prisma.permission.count).toHaveBeenCalledWith({
        where: { name: createPermissionDto.name },
      });
      expect(prisma.permission.create).toHaveBeenCalledWith({
        data: createPermissionDto,
      });
      expect(prisma.rolePermission.createMany).toHaveBeenCalledWith({
        data: [
          { roleId: 'role1', permissionId: createdPermission.id },
          { roleId: 'role2', permissionId: createdPermission.id },
        ],
        skipDuplicates: true,
      });
    });

    it('should throw ConflictException if permission already exists', async () => {
      const createPermissionDto: CreatePermissionDto = {
        name: 'Existing Permission',
        description: 'Existing Permission Description',
        roleIds: [],
      };

      (prisma.permission.count as jest.Mock).mockResolvedValue(1); // Permission exists

      await expect(service.create(createPermissionDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the permission with roles', async () => {
      const updatePermissionDto: UpdatePermissionDto = {
        name: 'Updated Permission',
        roleIds: ['role1', 'role2'],
      };
      const updatedPermission = { id: '1', ...updatePermissionDto };

      (prisma.permission.update as jest.Mock).mockResolvedValue(
        updatedPermission,
      );
      (prisma.rolePermission.createMany as jest.Mock).mockResolvedValue({
        count: 2,
      });

      const result = await service.update('1', updatePermissionDto);
      expect(result).toEqual(updatedPermission);
      expect(prisma.permission.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updatePermissionDto,
      });
      expect(prisma.rolePermission.createMany).toHaveBeenCalledWith({
        data: [
          { roleId: 'role1', permissionId: updatedPermission.id },
          { roleId: 'role2', permissionId: updatedPermission.id },
        ],
        skipDuplicates: true,
      });
    });

    it('should throw NotFoundException if permission not found', async () => {
      const updatePermissionDto: UpdatePermissionDto = {
        name: 'Updated Permission',
        roleIds: [],
      };

      (prisma.permission.update as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      );

      await expect(
        service.update('nonexistent-id', updatePermissionDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a permission by ID', async () => {
      (prisma.permission.delete as jest.Mock).mockResolvedValue(undefined);

      await expect(service.remove('1')).resolves.toBeUndefined();
      expect(prisma.permission.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if permission not found during delete', async () => {
      (prisma.permission.delete as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      );

      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
