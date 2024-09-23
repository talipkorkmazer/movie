import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@/prisma/prisma.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { WatchHistoryOutputDto } from '@/watch-history/dto/watch-history-output.dto';
import { WatchService } from '@watch-history/services/watch.service';

jest.mock('@/common/pagination.helper', () => ({
  createPaginator: jest.fn(() => jest.fn()), // Mock the pagination helper
}));

describe('WatchService', () => {
  let service: WatchService;
  let prisma: PrismaService;
  let mockRequest: Partial<Request>;

  beforeEach(async () => {
    mockRequest = { user: { id: 'userId' } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchService,
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

    service = module.get<WatchService>(WatchService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a new watch history entry', async () => {
      const movieId = '1';
      const sessionId = '1';
      const now = new Date();
      const createdWatchHistory: WatchHistoryOutputDto = {
        id: '1',
        watchedAt: now,
        Session: {
          id: sessionId,
          date: new Date(),
          timeSlot: '10:00-12:00',
          roomNumber: 1,
          updatedAt: now,
          createdAt: now,
        },
        Movie: {
          id: movieId,
          name: 'Movie 1',
          ageRestriction: 18,
          updatedAt: now,
          createdAt: now,
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
