import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from './session.service';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateSessionDto } from '@session/dto/create-session.dto';
import { UpdateSessionDto } from '@session/dto/update-session.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { createPaginator } from '@/common/pagination.helper';

jest.mock('@/common/pagination.helper', () => ({
  createPaginator: jest.fn(() => jest.fn()), // Mock pagination helper
}));

describe('SessionService', () => {
  let service: SessionService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: PrismaService,
          useValue: {
            session: {
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return a paginated result of sessions', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const movieId = '1';

      const paginatedSessionsFromDb = {
        data: [
          {
            id: '1',
            date: new Date('2024-09-22'),
            timeSlot: '10:00-12:00',
            roomNumber: 1,
            Movie: { id: '1', name: 'Movie 1' },
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          currentPage: 1,
          lastPage: 1,
        },
      };

      const paginate = jest.fn().mockResolvedValue(paginatedSessionsFromDb); // Mock paginated data
      (createPaginator as jest.Mock).mockReturnValue(paginate);

      const result = await service.findAll(movieId, paginationDto);

      expect(createPaginator).toHaveBeenCalledWith(paginationDto);
      expect(paginate).toHaveBeenCalledWith(prisma.session, {
        include: { Movie: true },
        where: { movieId },
      });

      expect(result).toEqual(paginatedSessionsFromDb);
    });
  });

  describe('find', () => {
    it('should return a session by movie ID and session ID', async () => {
      const movieId = '1';
      const sessionId = '1';

      const session = {
        id: sessionId,
        movieId,
        date: new Date('2024-09-22'),
        timeSlot: '10:00-12:00',
        roomNumber: 1,
      };

      (prisma.session.findFirst as jest.Mock).mockResolvedValue(session);

      const result = await service.find(movieId, sessionId);
      expect(result).toEqual(session);
      expect(prisma.session.findFirst).toHaveBeenCalledWith({
        where: { id: sessionId, movieId },
      });
    });

    it('should throw NotFoundException if the session is not found', async () => {
      const movieId = '1';
      const sessionId = 'nonexistent-id';

      (prisma.session.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.find(movieId, sessionId)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.session.findFirst).toHaveBeenCalledWith({
        where: { id: sessionId, movieId },
      });
    });
  });

  describe('create', () => {
    it('should create and return a new session', async () => {
      const movieId = '1';
      const createSessionDto: CreateSessionDto = {
        date: new Date('2024-09-22'),
        timeSlot: '10:00-12:00',
        roomNumber: 1,
      };

      const createdSession = {
        id: '1',
        movieId,
        ...createSessionDto,
      };

      (prisma.session.count as jest.Mock).mockResolvedValue(0); // No existing session
      (prisma.session.create as jest.Mock).mockResolvedValue(createdSession);

      const result = await service.create(movieId, createSessionDto);
      expect(result).toEqual(createdSession);
      expect(prisma.session.count).toHaveBeenCalledWith({
        where: {
          movieId,
          date: createSessionDto.date,
          timeSlot: createSessionDto.timeSlot,
          roomNumber: createSessionDto.roomNumber,
        },
      });
      expect(prisma.session.create).toHaveBeenCalledWith({
        data: { movieId, ...createSessionDto },
      });
    });

    it('should throw ConflictException if a session already exists for the same movie, time slot, and date', async () => {
      const movieId = '1';
      const createSessionDto: CreateSessionDto = {
        date: new Date('2024-09-22'),
        timeSlot: '10:00-12:00',
        roomNumber: 1,
      };

      (prisma.session.count as jest.Mock).mockResolvedValue(1); // Session already exists

      await expect(service.create(movieId, createSessionDto)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.session.count).toHaveBeenCalledWith({
        where: {
          movieId,
          date: createSessionDto.date,
          timeSlot: createSessionDto.timeSlot,
          roomNumber: createSessionDto.roomNumber,
        },
      });
    });
  });

  describe('update', () => {
    it('should update and return the session', async () => {
      const movieId = '1';
      const sessionId = '1';
      const updateSessionDto: UpdateSessionDto = {
        date: new Date('2024-09-23'),
        timeSlot: '12:00-14:00',
        roomNumber: 2,
      };

      const updatedSession = {
        id: sessionId,
        movieId,
        ...updateSessionDto,
      };

      (prisma.session.count as jest.Mock).mockResolvedValue(1); // Session exists
      (prisma.session.update as jest.Mock).mockResolvedValue(updatedSession);

      const result = await service.update(movieId, sessionId, updateSessionDto);
      expect(result).toEqual(updatedSession);
      expect(prisma.session.count).toHaveBeenCalledWith({
        where: { id: sessionId, movieId },
      });
      expect(prisma.session.update).toHaveBeenCalledWith({
        where: { id: sessionId },
        data: updateSessionDto,
      });
    });

    it('should throw NotFoundException if the session is not found during update', async () => {
      const movieId = '1';
      const sessionId = 'nonexistent-id';
      const updateSessionDto: UpdateSessionDto = {
        date: new Date('2024-09-23'),
        timeSlot: '12:00-14:00',
        roomNumber: 2,
      };

      (prisma.session.count as jest.Mock).mockResolvedValue(0); // Session doesn't exist

      await expect(
        service.update(movieId, sessionId, updateSessionDto),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.session.count).toHaveBeenCalledWith({
        where: { id: sessionId, movieId },
      });
    });
  });

  describe('remove', () => {
    it('should delete a session by movie ID and session ID', async () => {
      const movieId = '1';
      const sessionId = '1';

      (prisma.session.delete as jest.Mock).mockResolvedValue(undefined);

      await expect(service.remove(movieId, sessionId)).resolves.toBeUndefined();
      expect(prisma.session.delete).toHaveBeenCalledWith({
        where: { id: sessionId, movieId },
      });
    });

    it('should throw NotFoundException if the session is not found during deletion', async () => {
      const movieId = '1';
      const sessionId = 'nonexistent-id';

      (prisma.session.delete as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      );

      await expect(service.remove(movieId, sessionId)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.session.delete).toHaveBeenCalledWith({
        where: { id: sessionId, movieId },
      });
    });
  });
});
