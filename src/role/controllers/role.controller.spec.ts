import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from './role.controller';
import { RoleService } from '@role/services/role.service';
import { CreateRoleDto } from '@role/dto/create-role.dto';
import { UpdateRoleDto } from '@role/dto/update-role.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResult } from '@/common/types/paginated-result';
import { RolesOutputDto } from '@role/dto/roles-output.dto';
import { NotFoundException } from '@nestjs/common';

describe('RoleController', () => {
  let controller: RoleController;
  let service: RoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        {
          provide: RoleService,
          useValue: {
            findAll: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RoleController>(RoleController);
    service = module.get<RoleService>(RoleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return a paginated result of roles with transformed permissions', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const now = new Date();
      const paginatedRoles: PaginatedResult<RolesOutputDto> = {
        data: [
          {
            id: '1',
            name: 'Role 1',
            Permissions: [
              {
                id: '1',
                name: 'Permission 1',
                description: 'Permission 1 description',
                createdAt: now,
                updatedAt: now,
              },
            ],
            createdAt: now,
            updatedAt: now,
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

      (service.findAll as jest.Mock).mockResolvedValue(paginatedRoles);

      const result = await controller.findAll(paginationDto);
      expect(result).toEqual(paginatedRoles);
      expect(service.findAll).toHaveBeenCalledWith(paginationDto);
    });
  });

  describe('find', () => {
    it('should return a role with permissions by ID', async () => {
      const now = new Date();
      const role = {
        id: '1',
        name: 'Role 1',
        Permissions: [
          {
            id: '1',
            name: 'Permission 1',
            description: 'Permission 1 description',
            createdAt: now,
            updatedAt: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
      };

      (service.find as jest.Mock).mockResolvedValue(role);

      const result = await controller.find('1');
      expect(result).toEqual(role);
      expect(service.find).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if the role is not found', async () => {
      (service.find as jest.Mock).mockRejectedValue(new NotFoundException());

      await expect(controller.find('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(service.find).toHaveBeenCalledWith('nonexistent-id');
    });
  });

  describe('create', () => {
    it('should create and return a new role', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'New Role',
        permissionIds: ['perm1', 'perm2'],
      };
      const createdRole = { id: '1', name: 'New Role', Permissions: [] };

      (service.create as jest.Mock).mockResolvedValue(createdRole);

      const result = await controller.create(createRoleDto);
      expect(result).toEqual(createdRole);
      expect(service.create).toHaveBeenCalledWith(createRoleDto);
    });
  });

  describe('update', () => {
    it('should update and return the role', async () => {
      const updateRoleDto: UpdateRoleDto = {
        name: 'Updated Role',
        permissionIds: ['perm1', 'perm2'],
      };
      const updatedRole = { id: '1', name: 'Updated Role', Permissions: [] };

      (service.update as jest.Mock).mockResolvedValue(updatedRole);

      const result = await controller.update('1', updateRoleDto);
      expect(result).toEqual(updatedRole);
      expect(service.update).toHaveBeenCalledWith('1', updateRoleDto);
    });

    it('should throw NotFoundException if the role is not found', async () => {
      const updateRoleDto: UpdateRoleDto = {
        name: 'Updated Role',
        permissionIds: [],
      };

      (service.update as jest.Mock).mockRejectedValue(new NotFoundException());

      await expect(
        controller.update('nonexistent-id', updateRoleDto),
      ).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith(
        'nonexistent-id',
        updateRoleDto,
      );
    });
  });

  describe('remove', () => {
    it('should delete a role by ID', async () => {
      (service.remove as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.remove('1');
      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if the role is not found', async () => {
      (service.remove as jest.Mock).mockRejectedValue(new NotFoundException());

      await expect(controller.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(service.remove).toHaveBeenCalledWith('nonexistent-id');
    });
  });
});
