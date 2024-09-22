import { Test, TestingModule } from '@nestjs/testing';
import { WatchHistoryService } from './watch-history.service';
import { PrismaService } from '@/prisma/prisma.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { createPaginator } from '@/common/pagination.helper';
import { PaginatedResult } from '@/common/types/paginated-result';
import { WatchHistoryOutputDto } from '@/watch-history/dto/watch-history-output.dto';

jest.mock('@/common/pagination.helper', () => ({
  createPaginator: jest.fn(() => jest.fn()), // Mock the pagination helper
}));

describe('WatchHistoryService', () => {
  let service: WatchHistoryService;
  let prisma: PrismaService;
  let mockRequest: Partial<Request>;

  beforeEach(async () => {
    mockRequest = { user: { id: 'userId' } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchHistoryService,
        {
          provide: PrismaService,
          useValue: {
            watchHistory: {
              findFirst: jest.fn(),
              create: jest.fn(),
            },
            movie: {
              count: jest.fn(),
            },
            session: {
              count: jest.fn(),
            },
          },
        },
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
      ],
    }).compile();

    service = module.get<WatchHistoryService>(WatchHistoryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return a paginated result of watch history for the current user', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const movieId = '1';
      const sessionId = '1';

      const paginatedWatchHistory: PaginatedResult<WatchHistoryOutputDto> = {
        data: [
          {
            id: '1',
            watchedAt: new Date(),
            Session: {
              id: 'sessionId',
              date: new Date(),
              timeSlot: '10:00-12:00',
              roomNumber: 1,
              updatedAt: new Date(),
              createdAt: new Date(),
            },
            Movie: {
              id: movieId,
              name: 'Movie 1',
              ageRestriction: 18,
              updatedAt: new Date(),
              createdAt: new Date(),
            },
            User: { id: 'userId', username: 'user1', age: 25 },
          },
        ],
        meta: {
          total: 1,
          currentPage: 1,
          perPage: 10,
          lastPage: 1,
          next: null,
          prev: null,
        },
      };

      const paginate = jest.fn().mockResolvedValue(paginatedWatchHistory);
      (createPaginator as jest.Mock).mockReturnValue(paginate);

      // Mock existence checks
      (prisma.movie.count as jest.Mock).mockResolvedValue(1);
      (prisma.session.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll(movieId, sessionId, paginationDto);
      expect(result).toEqual(paginatedWatchHistory);
      expect(prisma.movie.count).toHaveBeenCalledWith({
        where: { id: movieId },
      });
      expect(prisma.session.count).toHaveBeenCalledWith({
        where: { id: sessionId },
      });
      expect(paginate).toHaveBeenCalledWith(
        prisma.watchHistory,
        expect.anything(),
      );
    });
  });

  describe('find', () => {
    it('should return a watch history entry by movie ID, session ID, and ticket ID', async () => {
      const movieId = '1';
      const sessionId = '1';
      const ticketId = '1';

      const watchHistory: WatchHistoryOutputDto = {
        id: ticketId,
        watchedAt: new Date(),
        Session: {
          id: sessionId,
          date: new Date(),
          timeSlot: '10:00-12:00',
          roomNumber: 1,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
        Movie: {
          id: movieId,
          name: 'Movie 1',
          ageRestriction: 18,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
        User: { id: 'userId', username: 'user1', age: 25 },
      };

      // Mock existence checks
      (prisma.movie.count as jest.Mock).mockResolvedValue(1);
      (prisma.session.count as jest.Mock).mockResolvedValue(1);
      (prisma.watchHistory.findFirst as jest.Mock).mockResolvedValue(
        watchHistory,
      );

      const result = await service.find(movieId, sessionId, ticketId);
      expect(result).toEqual(watchHistory);
      expect(prisma.watchHistory.findFirst).toHaveBeenCalledWith({
        where: { id: ticketId, userId: 'userId' },
        select: expect.anything(),
      });
    });

    it('should throw NotFoundException if watch history is not found', async () => {
      const movieId = '1';
      const sessionId = '1';
      const ticketId = 'nonexistent-id';

      // Mock existence checks
      (prisma.movie.count as jest.Mock).mockResolvedValue(1);
      (prisma.session.count as jest.Mock).mockResolvedValue(1);
      (prisma.watchHistory.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.find(movieId, sessionId, ticketId)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.watchHistory.findFirst).toHaveBeenCalledWith({
        where: { id: ticketId, userId: 'userId' },
        select: expect.anything(),
      });
    });
  });

  describe('create', () => {
    it('should create and return a new watch history entry', async () => {
      const movieId = '1';
      const sessionId = '1';

      const createdWatchHistory: WatchHistoryOutputDto = {
        id: '1',
        watchedAt: new Date(),
        Session: {
          id: sessionId,
          date: new Date(),
          timeSlot: '10:00-12:00',
          roomNumber: 1,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
        Movie: {
          id: movieId,
          name: 'Movie 1',
          ageRestriction: 18,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
        User: { id: 'userId', username: 'user1', age: 25 },
      };

      // Mock existence checks
      (prisma.movie.count as jest.Mock).mockResolvedValue(1);
      (prisma.session.count as jest.Mock).mockResolvedValue(1);
      (prisma.watchHistory.create as jest.Mock).mockResolvedValue(
        createdWatchHistory,
      );

      const result = await service.create(movieId, sessionId);
      expect(result).toEqual(createdWatchHistory);
      expect(prisma.watchHistory.create).toHaveBeenCalledWith({
        data: { userId: 'userId', sessionId, movieId },
        select: expect.anything(),
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should throw UnauthorizedException if no user is found in the request', async () => {
      mockRequest.user = undefined;

      await expect(() => service['getCurrentUser']()).toThrow(
        UnauthorizedException,
      );
    });

    it('should return the current user if the user exists in the request', async () => {
      const user = service['getCurrentUser']();
      expect(user).toEqual({ id: 'userId' });
    });
  });

  describe('checkMovieAndSessionExistence', () => {
    it('should throw NotFoundException if movie does not exist', async () => {
      const movieId = '1';
      const sessionId = '1';

      (prisma.movie.count as jest.Mock).mockResolvedValue(0); // Movie doesn't exist

      await expect(
        service['checkMovieAndSessionExistence'](movieId, sessionId),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.movie.count).toHaveBeenCalledWith({
        where: { id: movieId },
      });
    });

    it('should throw NotFoundException if session does not exist', async () => {
      const movieId = '1';
      const sessionId = '1';

      (prisma.movie.count as jest.Mock).mockResolvedValue(1); // Movie exists
      (prisma.session.count as jest.Mock).mockResolvedValue(0); // Session doesn't exist

      await expect(
        service['checkMovieAndSessionExistence'](movieId, sessionId),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.session.count).toHaveBeenCalledWith({
        where: { id: sessionId },
      });
    });

    it('should not throw if both movie and session exist', async () => {
      const movieId = '1';
      const sessionId = '1';

      (prisma.movie.count as jest.Mock).mockResolvedValue(1); // Movie exists
      (prisma.session.count as jest.Mock).mockResolvedValue(1); // Session exists

      await expect(
        service['checkMovieAndSessionExistence'](movieId, sessionId),
      ).resolves.toBeUndefined();
    });
  });
});
