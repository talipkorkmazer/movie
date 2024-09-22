import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from '@role/dto/create-role.dto';
import { UpdateRoleDto } from '@role/dto/update-role.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResult } from '@/common/types/paginated-result';
import { RolesOutputDto } from '@role/dto/roles-output.dto';
import { createPaginator } from '@/common/pagination.helper';

jest.mock('@/common/pagination.helper', () => ({
  createPaginator: jest.fn(() => jest.fn()), // Mock pagination helper
}));

describe('RoleService', () => {
  let service: RoleService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: PrismaService,
          useValue: {
            role: {
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

    service = module.get<RoleService>(RoleService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return a paginated result of roles with transformed permissions', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };

      const paginatedRolesFromDb = {
        data: [
          {
            id: '1',
            name: 'Role 1',
            createdAt: new Date('2024-09-22T15:31:30.128Z'),
            updatedAt: new Date('2024-09-22T15:31:30.128Z'),
            Permissions: [
              {
                permission: {
                  id: '1',
                  name: 'Permission 1',
                  description: 'Description 1',
                  createdAt: new Date('2024-09-22T15:31:30.128Z'),
                  updatedAt: new Date('2024-09-22T15:31:30.128Z'),
                },
              },
            ],
          },
        ],
        meta: {
          total: 1,
          currentPage: 1,
          lastPage: 1,
          next: null,
          prev: null,
          perPage: 10,
        },
      };

      const expectedTransformedResult: PaginatedResult<RolesOutputDto> = {
        data: [
          {
            id: '1',
            name: 'Role 1',
            createdAt: new Date('2024-09-22T15:31:30.128Z'),
            updatedAt: new Date('2024-09-22T15:31:30.128Z'),
            Permissions: [
              {
                id: '1',
                name: 'Permission 1',
                description: 'Description 1',
                createdAt: new Date('2024-09-22T15:31:30.128Z'),
                updatedAt: new Date('2024-09-22T15:31:30.128Z'),
              },
            ],
          },
        ],
        meta: {
          total: 1,
          currentPage: 1,
          lastPage: 1,
          next: null,
          prev: null,
          perPage: 10,
        },
      };

      const paginate = jest.fn().mockResolvedValue(paginatedRolesFromDb); // Mock the raw data
      (createPaginator as jest.Mock).mockReturnValue(paginate); // Mock pagination

      const result = await service.findAll(paginationDto);

      expect(createPaginator).toHaveBeenCalledWith(paginationDto);
      expect(paginate).toHaveBeenCalledWith(prisma.role, {
        include: { Permissions: { include: { permission: true } } },
      });

      expect(result).toEqual(expectedTransformedResult);
    });
  });

  describe('find', () => {
    it('should return a role with permissions by ID', async () => {
      const role = {
        id: '1',
        name: 'Role 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        Permissions: [
          {
            permission: {
              id: '1',
              name: 'Permission 1',
              description: 'Description 1',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        ],
      };

      (prisma.role.findFirst as jest.Mock).mockResolvedValue(role);

      const result = await service.find('1');
      expect(result).toEqual({
        ...role,
        Permissions: [
          {
            id: '1',
            name: 'Permission 1',
            description: 'Description 1',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });
      expect(prisma.role.findFirst).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { Permissions: { include: { permission: true } } },
      });
    });

    it('should throw NotFoundException if the role is not found', async () => {
      (prisma.role.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.find('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create and return a new role with permissions', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'New Role',
        permissionIds: ['perm1', 'perm2'],
      };
      const createdRole = { id: '1', name: 'New Role' };

      (prisma.role.count as jest.Mock).mockResolvedValue(0); // No existing role
      (prisma.role.create as jest.Mock).mockResolvedValue(createdRole);
      (prisma.rolePermission.createMany as jest.Mock).mockResolvedValue({
        count: 2,
      });

      const result = await service.create(createRoleDto);
      expect(result).toEqual(createdRole);
      expect(prisma.role.count).toHaveBeenCalledWith({
        where: { name: createRoleDto.name },
      });
      expect(prisma.role.create).toHaveBeenCalledWith({
        data: { name: createRoleDto.name },
      });
      expect(prisma.rolePermission.createMany).toHaveBeenCalledWith({
        data: [
          { roleId: createdRole.id, permissionId: 'perm1' },
          { roleId: createdRole.id, permissionId: 'perm2' },
        ],
        skipDuplicates: true,
      });
    });

    it('should throw ConflictException if role already exists', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'Existing Role',
        permissionIds: [],
      };

      (prisma.role.count as jest.Mock).mockResolvedValue(1); // Role exists

      await expect(service.create(createRoleDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the role with permissions', async () => {
      const updateRoleDto: UpdateRoleDto = {
        name: 'Updated Role',
        permissionIds: ['perm1', 'perm2'],
      };
      const updatedRole = { id: '1', name: 'Updated Role' };

      (prisma.role.update as jest.Mock).mockResolvedValue(updatedRole);
      (prisma.rolePermission.createMany as jest.Mock).mockResolvedValue({
        count: 2,
      });

      const result = await service.update('1', updateRoleDto);
      expect(result).toEqual(updatedRole);
      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateRoleDto,
      });
      expect(prisma.rolePermission.createMany).toHaveBeenCalledWith({
        data: [
          { roleId: '1', permissionId: 'perm1' },
          { roleId: '1', permissionId: 'perm2' },
        ],
        skipDuplicates: true,
      });
    });

    it('should throw NotFoundException if the role is not found', async () => {
      const updateRoleDto: UpdateRoleDto = {
        name: 'Updated Role',
        permissionIds: [],
      };

      (prisma.role.update as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      );

      await expect(
        service.update('nonexistent-id', updateRoleDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a role by ID', async () => {
      (prisma.role.delete as jest.Mock).mockResolvedValue(undefined);

      await expect(service.remove('1')).resolves.toBeUndefined();
      expect(prisma.role.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException if the role is not found', async () => {
      (prisma.role.delete as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      );

      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
