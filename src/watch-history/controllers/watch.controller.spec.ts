import { Test, TestingModule } from '@nestjs/testing';
import { WatchController } from './watch.controller';
import { WatchHistoryService } from '@/watch-history/services/watch-history.service';
import { WatchHistoryOutputDto } from '@/watch-history/dto/watch-history-output.dto';

describe('WatchHistoryController', () => {
  let controller: WatchController;
  let service: WatchHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WatchController],
      providers: [
        {
          provide: WatchHistoryService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WatchController>(WatchController);
    service = module.get<WatchHistoryService>(WatchHistoryService);
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

      (service.create as jest.Mock).mockResolvedValue(createdWatchHistory);

      const result = await controller.create(movieId, sessionId);
      expect(result).toEqual(createdWatchHistory);
      expect(service.create).toHaveBeenCalledWith(movieId, sessionId);
    });
  });
});
