import { Test, TestingModule } from '@nestjs/testing';
import { TicketController } from './ticket.controller';
import { TicketService } from '@ticket/services/ticket.service';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResult } from '@/common/types/paginated-result';
import { TicketOutputDto } from '@ticket/dto/ticket-output.dto';
import { NotFoundException } from '@nestjs/common';

describe('TicketController', () => {
  let controller: TicketController;
  let service: TicketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketController],
      providers: [
        {
          provide: TicketService,
          useValue: {
            findAll: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TicketController>(TicketController);
    service = module.get<TicketService>(TicketService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return a paginated result of tickets', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const movieId = '1';
      const sessionId = '1';

      const paginatedTickets: PaginatedResult<TicketOutputDto> = {
        data: [
          {
            id: '1',
            purchaseDate: new Date(),
            Session: {
              id: 'sessionId',
              date: new Date(),
              timeSlot: '10:00-12:00',
              roomNumber: 1,
              updatedAt: new Date(),
              createdAt: new Date(),
              Movie: {
                id: movieId,
                name: 'Movie 1',
                ageRestriction: 18,
                updatedAt: new Date(),
                createdAt: new Date(),
              },
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

      (service.findAll as jest.Mock).mockResolvedValue(paginatedTickets);

      const result = await controller.findAll(
        movieId,
        sessionId,
        paginationDto,
      );
      expect(result).toEqual(paginatedTickets);
      expect(service.findAll).toHaveBeenCalledWith(
        movieId,
        sessionId,
        paginationDto,
      );
    });
  });

  describe('find', () => {
    it('should return a ticket by movie ID, session ID, and ticket ID', async () => {
      const movieId = '1';
      const sessionId = '1';
      const ticketId = '1';

      const ticket: TicketOutputDto = {
        id: ticketId,
        purchaseDate: new Date(),
        Session: {
          id: sessionId,
          date: new Date(),
          timeSlot: '10:00-12:00',
          roomNumber: 1,
          updatedAt: new Date(),
          createdAt: new Date(),
          Movie: {
            id: movieId,
            name: 'Movie 1',
            ageRestriction: 18,
            updatedAt: new Date(),
            createdAt: new Date(),
          },
        },
        User: { id: 'userId', username: 'user1', age: 25 },
      };

      (service.find as jest.Mock).mockResolvedValue(ticket);

      const result = await controller.find(movieId, sessionId, ticketId);
      expect(result).toEqual(ticket);
      expect(service.find).toHaveBeenCalledWith(movieId, sessionId, ticketId);
    });

    it('should throw NotFoundException if ticket is not found', async () => {
      const movieId = '1';
      const sessionId = '1';
      const ticketId = 'nonexistent-id';

      (service.find as jest.Mock).mockRejectedValue(new NotFoundException());

      await expect(
        controller.find(movieId, sessionId, ticketId),
      ).rejects.toThrow(NotFoundException);
      expect(service.find).toHaveBeenCalledWith(movieId, sessionId, ticketId);
    });
  });

  describe('create', () => {
    it('should create and return a new ticket', async () => {
      const movieId = '1';
      const sessionId = '1';

      const createdTicket: TicketOutputDto = {
        id: '1',
        purchaseDate: new Date(),
        Session: {
          id: sessionId,
          date: new Date(),
          timeSlot: '10:00-12:00',
          roomNumber: 1,
          updatedAt: new Date(),
          createdAt: new Date(),
          Movie: {
            id: movieId,
            name: 'Movie 1',
            ageRestriction: 18,
            updatedAt: new Date(),
            createdAt: new Date(),
          },
        },
        User: { id: 'userId', username: 'user1', age: 25 },
      };

      (service.create as jest.Mock).mockResolvedValue(createdTicket);

      const result = await controller.create(movieId, sessionId);
      expect(result).toEqual(createdTicket);
      expect(service.create).toHaveBeenCalledWith(movieId, sessionId);
    });
  });
});
