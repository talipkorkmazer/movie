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
            ticket: { findFirst: jest.fn(), update: jest.fn() },
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
      (prisma.movie.count as jest.Mock).mockResolvedValue(1); // Movie exists
      (prisma.session.count as jest.Mock).mockResolvedValue(1); // Session exists

      // Mock that the user has a valid ticket
      (prisma.ticket.findFirst as jest.Mock).mockResolvedValue({
        id: 'ticketId',
      });

      // Mock ticket update (mark ticket as used)
      (prisma.ticket.update as jest.Mock).mockResolvedValue({
        id: 'ticketId',
        isUsed: true,
      });

      // Mock watch history creation
      (prisma.watchHistory.create as jest.Mock).mockResolvedValue(
        createdWatchHistory,
      );

      // Act
      const result = await service.create(movieId, sessionId);

      // Assert
      expect(prisma.movie.count).toHaveBeenCalledWith({
        where: { id: movieId },
      });
      expect(prisma.session.count).toHaveBeenCalledWith({
        where: { id: sessionId },
      });
      expect(prisma.ticket.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'userId',
          sessionId,
          isUsed: false,
        },
        select: {
          id: true,
        },
      });
      expect(prisma.ticket.update).toHaveBeenCalledWith({
        where: { id: 'ticketId' },
        data: { isUsed: true },
      });
      expect(prisma.watchHistory.create).toHaveBeenCalledWith({
        data: { userId: 'userId', sessionId, movieId },
        select: service.select,
      });

      expect(result).toEqual(createdWatchHistory);
    });

    it('should throw UnauthorizedException if the user does not have a valid ticket', async () => {
      const movieId = '1';
      const sessionId = '1';

      // Mock existence checks
      (prisma.movie.count as jest.Mock).mockResolvedValue(1); // Movie exists
      (prisma.session.count as jest.Mock).mockResolvedValue(1); // Session exists

      // Mock that no valid ticket exists for the user
      (prisma.ticket.findFirst as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(movieId, sessionId)).rejects.toThrow(
        UnauthorizedException,
      );

      // Ensure ticket update and watchHistory create were never called
      expect(prisma.ticket.update).not.toHaveBeenCalled();
      expect(prisma.watchHistory.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if movie or session does not exist', async () => {
      const movieId = '1';
      const sessionId = '1';

      // Mock movie not existing
      (prisma.movie.count as jest.Mock).mockResolvedValue(0);

      // Act & Assert
      await expect(service.create(movieId, sessionId)).rejects.toThrow(
        NotFoundException,
      );

      // Ensure session count, ticket find, ticket update, and watchHistory create were never called
      expect(prisma.session.count).not.toHaveBeenCalled();
      expect(prisma.ticket.findFirst).not.toHaveBeenCalled();
      expect(prisma.ticket.update).not.toHaveBeenCalled();
      expect(prisma.watchHistory.create).not.toHaveBeenCalled();
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
