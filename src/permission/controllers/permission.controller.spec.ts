import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResult } from '@/common/types/paginated-result';
import { PermissionController } from '@permission/controllers/permission.controller';
import { PermissionService } from '@permission/services/permission.service';
import { CreatePermissionDto } from '@permission/dto/create-permission.dto';
import { UpdatePermissionDto } from '@permission/dto/update-permission.dto';
import { PermissionOutputDto } from '@permission/dto/permission-output.dto';

describe('PermissionController', () => {
  let controller: PermissionController;
  let service: PermissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionController],
      providers: [
        {
          provide: PermissionService,
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

    controller = module.get<PermissionController>(PermissionController);
    service = module.get<PermissionService>(PermissionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return a paginated result of permissions', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const now = new Date();
      const paginatedResult: PaginatedResult<PermissionOutputDto> = {
        data: [
          {
            id: '1',
            name: 'Permission 1',
            description: 'Description',
            updatedAt: now,
            createdAt: now,
          },
        ],
        meta: {
          currentPage: 1,
          lastPage: 1,
          next: null,
          perPage: 10,
          prev: null,
          total: 1,
        },
      };

      (service.findAll as jest.Mock).mockResolvedValue(paginatedResult);

      const result = await controller.findAll(paginationDto);
      expect(result).toEqual(paginatedResult);
      expect(service.findAll).toHaveBeenCalledWith(paginationDto);
    });
  });

  describe('find', () => {
    it('should return a permission by ID', async () => {
      const permission = { id: '1', name: 'Permission 1' };

      (service.find as jest.Mock).mockResolvedValue(permission);

      const result = await controller.find('1');
      expect(result).toEqual(permission);
      expect(service.find).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if permission is not found', async () => {
      (service.find as jest.Mock).mockRejectedValue(new NotFoundException());

      await expect(controller.find('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(service.find).toHaveBeenCalledWith('nonexistent-id');
    });
  });

  describe('create', () => {
    it('should create and return a new permission', async () => {
      const createPermissionDto: CreatePermissionDto = {
        name: 'New Permission',
        description: 'New Permission Description',
        roleIds: [],
      };
      const createdPermission = { id: '1', name: 'New Permission' };

      (service.create as jest.Mock).mockResolvedValue(createdPermission);

      const result = await controller.create(createPermissionDto);
      expect(result).toEqual(createdPermission);
      expect(service.create).toHaveBeenCalledWith(createPermissionDto);
    });
  });

  describe('update', () => {
    it('should update and return the permission', async () => {
      const updatePermissionDto: UpdatePermissionDto = {
        name: 'Updated Permission',
        roleIds: [],
      };
      const updatedPermission = { id: '1', ...updatePermissionDto };

      (service.update as jest.Mock).mockResolvedValue(updatedPermission);

      const result = await controller.update('1', updatePermissionDto);
      expect(result).toEqual(updatedPermission);
      expect(service.update).toHaveBeenCalledWith('1', updatePermissionDto);
    });

    it('should throw NotFoundException if the permission is not found', async () => {
      const updatePermissionDto: UpdatePermissionDto = {
        name: 'Updated Permission',
        roleIds: [],
      };

      (service.update as jest.Mock).mockRejectedValue(new NotFoundException());

      await expect(
        controller.update('nonexistent-id', updatePermissionDto),
      ).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith(
        'nonexistent-id',
        updatePermissionDto,
      );
    });
  });

  describe('remove', () => {
    it('should delete a permission by ID', async () => {
      (service.remove as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.remove('1');
      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if the permission is not found', async () => {
      (service.remove as jest.Mock).mockRejectedValue(new NotFoundException());

      await expect(controller.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(service.remove).toHaveBeenCalledWith('nonexistent-id');
    });
  });
});
