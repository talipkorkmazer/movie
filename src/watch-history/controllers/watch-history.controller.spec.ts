import { Test, TestingModule } from '@nestjs/testing';
import { WatchHistoryService } from '@/watch-history/services/watch-history.service';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResult } from '@/common/types/paginated-result';
import { WatchHistoryOutputDto } from '@/watch-history/dto/watch-history-output.dto';
import { NotFoundException } from '@nestjs/common';
import { WatchHistoryController } from '@watch-history/controllers/watch-history.controller';

describe('WatchHistoryController', () => {
  let controller: WatchHistoryController;
  let service: WatchHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WatchHistoryController],
      providers: [
        {
          provide: WatchHistoryService,
          useValue: {
            findAll: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WatchHistoryController>(WatchHistoryController);
    service = module.get<WatchHistoryService>(WatchHistoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return a paginated result of watch histories', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const movieId = '1';
      const sessionId = '1';
      const now = new Date();
      const paginatedWatchHistories: PaginatedResult<WatchHistoryOutputDto> = {
        data: [
          {
            id: '1',
            watchedAt: now,
            Session: {
              id: 'sessionId',
              date: now,
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

      (service.findAll as jest.Mock).mockResolvedValue(paginatedWatchHistories);

      const result = await controller.findAll(
        movieId,
        sessionId,
        paginationDto,
      );
      expect(result).toEqual(paginatedWatchHistories);
      expect(service.findAll).toHaveBeenCalledWith(
        movieId,
        sessionId,
        paginationDto,
      );
    });
  });

  describe('find', () => {
    it('should return a watch history by movie ID, session ID, and watch history ID', async () => {
      const movieId = '1';
      const sessionId = '1';
      const watchHistoryId = '1';
      const now = new Date();
      const watchHistory: WatchHistoryOutputDto = {
        id: watchHistoryId,
        watchedAt: now,
        Session: {
          id: sessionId,
          date: now,
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

      (service.find as jest.Mock).mockResolvedValue(watchHistory);

      const result = await controller.find(movieId, sessionId, watchHistoryId);
      expect(result).toEqual(watchHistory);
      expect(service.find).toHaveBeenCalledWith(
        movieId,
        sessionId,
        watchHistoryId,
      );
    });

    it('should throw NotFoundException if watch history is not found', async () => {
      const movieId = '1';
      const sessionId = '1';
      const watchHistoryId = 'nonexistent-id';

      (service.find as jest.Mock).mockRejectedValue(new NotFoundException());

      await expect(
        controller.find(movieId, sessionId, watchHistoryId),
      ).rejects.toThrow(NotFoundException);
      expect(service.find).toHaveBeenCalledWith(
        movieId,
        sessionId,
        watchHistoryId,
      );
    });
  });
});
