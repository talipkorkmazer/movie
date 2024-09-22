import { Test, TestingModule } from '@nestjs/testing';
import { SessionController } from './session.controller';
import { SessionService } from '@session/services/session.service';
import { CreateSessionDto } from '@session/dto/create-session.dto';
import { UpdateSessionDto } from '@session/dto/update-session.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResult } from '@/common/types/paginated-result';
import { SessionsOutputDto } from '@session/dto/sessions-output.dto';
import { SessionOutputDto } from '@session/dto/session-output.dto';
import { NotFoundException } from '@nestjs/common';

describe('SessionController', () => {
  let controller: SessionController;
  let service: SessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionController],
      providers: [
        {
          provide: SessionService,
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

    controller = module.get<SessionController>(SessionController);
    service = module.get<SessionService>(SessionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return a paginated result of sessions', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const movieId = '1';
      const now = new Date();
      const paginatedSessions: PaginatedResult<SessionsOutputDto> = {
        data: [
          {
            id: '1',
            date: now,
            timeSlot: '10:00-12:00',
            roomNumber: 1,
            updatedAt: now,
            createdAt: now,
            Movie: {
              id: '1',
              name: 'Movie 1',
              ageRestriction: 18,
              updatedAt: now,
              createdAt: now,
            },
          },
        ],
        meta: {
          total: 1,
          currentPage: 1,
          lastPage: 1,
          perPage: 10,
          next: null,
          prev: null,
        },
      };

      (service.findAll as jest.Mock).mockResolvedValue(paginatedSessions);

      const result = await controller.findAll(movieId, paginationDto);
      expect(result).toEqual(paginatedSessions);
      expect(service.findAll).toHaveBeenCalledWith(movieId, paginationDto);
    });
  });

  describe('find', () => {
    it('should return a session by movie ID and session ID', async () => {
      const movieId = '1';
      const sessionId = '1';
      const now = new Date();
      const session: SessionOutputDto = {
        id: sessionId,
        date: new Date(),
        movieId,
        timeSlot: '10:00-12:00',
        roomNumber: 1,
        updatedAt: now,
        createdAt: now,
      };

      (service.find as jest.Mock).mockResolvedValue(session);

      const result = await controller.find(movieId, sessionId);
      expect(result).toEqual(session);
      expect(service.find).toHaveBeenCalledWith(movieId, sessionId);
    });

    it('should throw NotFoundException if the session is not found', async () => {
      const movieId = '1';
      const sessionId = 'nonexistent-id';

      (service.find as jest.Mock).mockRejectedValue(new NotFoundException());

      await expect(controller.find(movieId, sessionId)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.find).toHaveBeenCalledWith(movieId, sessionId);
    });
  });

  describe('create', () => {
    it('should create and return a new session', async () => {
      const movieId = '1';
      const createSessionDto: CreateSessionDto = {
        date: new Date(),
        timeSlot: '10:00-12:00',
        roomNumber: 1,
      };

      const createdSession = {
        id: '1',
        movieId,
        ...createSessionDto,
      };

      (service.create as jest.Mock).mockResolvedValue(createdSession);

      const result = await controller.create(movieId, createSessionDto);
      expect(result).toEqual(createdSession);
      expect(service.create).toHaveBeenCalledWith(movieId, createSessionDto);
    });
  });

  describe('update', () => {
    it('should update and return the session', async () => {
      const movieId = '1';
      const sessionId = '1';
      const updateSessionDto: UpdateSessionDto = {
        date: new Date(),
        timeSlot: '12:00-14:00',
        roomNumber: 2,
      };

      const updatedSession = {
        id: sessionId,
        movieId,
        ...updateSessionDto,
      };

      (service.update as jest.Mock).mockResolvedValue(updatedSession);

      const result = await controller.update(
        movieId,
        sessionId,
        updateSessionDto,
      );
      expect(result).toEqual(updatedSession);
      expect(service.update).toHaveBeenCalledWith(
        movieId,
        sessionId,
        updateSessionDto,
      );
    });

    it('should throw NotFoundException if the session is not found during update', async () => {
      const movieId = '1';
      const sessionId = 'nonexistent-id';
      const updateSessionDto: UpdateSessionDto = {
        date: new Date(),
        timeSlot: '12:00-14:00',
        roomNumber: 2,
      };

      (service.update as jest.Mock).mockRejectedValue(new NotFoundException());

      await expect(
        controller.update(movieId, sessionId, updateSessionDto),
      ).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith(
        movieId,
        sessionId,
        updateSessionDto,
      );
    });
  });

  describe('remove', () => {
    it('should delete a session by movie ID and session ID', async () => {
      const movieId = '1';
      const sessionId = '1';

      (service.remove as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.remove(movieId, sessionId);
      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(movieId, sessionId);
    });

    it('should throw NotFoundException if the session is not found during deletion', async () => {
      const movieId = '1';
      const sessionId = 'nonexistent-id';

      (service.remove as jest.Mock).mockRejectedValue(new NotFoundException());

      await expect(controller.remove(movieId, sessionId)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.remove).toHaveBeenCalledWith(movieId, sessionId);
    });
  });
});
