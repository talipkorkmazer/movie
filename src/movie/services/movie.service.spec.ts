import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movie.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from '../dto/create-movie.dto';
import { UpdateMovieDto } from '../dto/update-movie.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { createPaginator } from '@/common/pagination.helper';
import { PaginatedResult } from '@/common/types/paginated-result';
import { MoviesOutputDto } from '@movie/dto/movies-output.dto';

jest.mock('@/common/pagination.helper', () => ({
  createPaginator: jest.fn(() => jest.fn()), // Mock pagination
}));

describe('MovieService', () => {
  let service: MovieService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: PrismaService,
          useValue: {
            movie: {
              findFirst: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              createMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              deleteMany: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MovieService>(MovieService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mock call history after each test
  });

  describe('findAll', () => {
    it('should return paginated result of movies', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const paginatedResult: PaginatedResult<MoviesOutputDto> = {
        data: [
          {
            id: '1',
            name: 'Movie 1',
            ageRestriction: 18,
            updatedAt: new Date(),
            createdAt: new Date(),
            Sessions: [],
          },
        ],
        meta: {
          currentPage: 0,
          lastPage: 0,
          next: undefined,
          perPage: 0,
          prev: undefined,
          total: 0,
        },
      };
      const paginate = jest.fn().mockResolvedValue(paginatedResult);

      (createPaginator as jest.Mock).mockReturnValue(paginate);

      const result = await service.findAll(paginationDto);

      expect(createPaginator).toHaveBeenCalledWith(paginationDto);
      expect(paginate).toHaveBeenCalledWith(prisma.movie, {
        include: { Sessions: true },
      });
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('find', () => {
    it('should return a movie by ID', async () => {
      const movie = { id: '1', name: 'Movie 1' };

      (prisma.movie.findFirst as jest.Mock).mockResolvedValue(movie);

      const result = await service.find('1');
      expect(result).toEqual(movie);
      expect(prisma.movie.findFirst).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if movie not found', async () => {
      (prisma.movie.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.find('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create and return a new movie', async () => {
      const createMovieDto: CreateMovieDto = {
        name: 'New Movie',
        ageRestriction: 13,
      };
      const createdMovie = { id: '1', ...createMovieDto };

      (prisma.movie.count as jest.Mock).mockResolvedValue(0); // No existing movie
      (prisma.movie.create as jest.Mock).mockResolvedValue(createdMovie);

      const result = await service.create(createMovieDto);
      expect(result).toEqual(createdMovie);
      expect(prisma.movie.count).toHaveBeenCalledWith({
        where: { name: createMovieDto.name },
      });
      expect(prisma.movie.create).toHaveBeenCalledWith({
        data: createMovieDto,
      });
    });

    it('should throw ConflictException if movie already exists', async () => {
      const createMovieDto: CreateMovieDto = {
        name: 'Existing Movie',
        ageRestriction: 13,
      };

      (prisma.movie.count as jest.Mock).mockResolvedValue(1); // Movie already exists

      await expect(service.create(createMovieDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('bulkCreate', () => {
    it('should create movies in bulk successfully', async () => {
      const movies: CreateMovieDto[] = [
        { name: 'Movie 1', ageRestriction: 12 },
        { name: 'Movie 2', ageRestriction: 16 },
      ];

      // Simulate that no movies already exist
      (prisma.movie.findMany as jest.Mock).mockResolvedValue([]);

      // Simulate successful creation
      (prisma.movie.createMany as jest.Mock).mockResolvedValue({ count: 2 });

      // Simulate fetching created movies
      const createdMovies = [
        {
          id: '1',
          name: 'Movie 1',
          ageRestriction: 12,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Movie 2',
          ageRestriction: 16,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      (prisma.movie.findMany as jest.Mock).mockResolvedValueOnce(createdMovies);

      const result = await service.bulkCreate(movies);
      expect(result).toEqual([
        {
          id: '1',
          name: 'Movie 1',
          ageRestriction: 12,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: '2',
          name: 'Movie 2',
          ageRestriction: 16,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);
      expect(prisma.movie.createMany).toHaveBeenCalledWith({
        data: movies,
        skipDuplicates: true,
      });
      expect(prisma.movie.findMany).toHaveBeenCalledTimes(1); // Called before and after create
    });
  });

  describe('update', () => {
    it('should update and return the movie', async () => {
      const updateMovieDto: UpdateMovieDto = {
        name: 'Updated Movie',
        ageRestriction: 16,
      };
      const updatedMovie = { id: '1', ...updateMovieDto };

      (prisma.movie.count as jest.Mock).mockResolvedValue(1); // Movie exists
      (prisma.movie.update as jest.Mock).mockResolvedValue(updatedMovie);

      const result = await service.update('1', updateMovieDto);
      expect(result).toEqual(updatedMovie);
      expect(prisma.movie.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateMovieDto,
      });
    });

    it('should throw NotFoundException if movie not found', async () => {
      (prisma.movie.count as jest.Mock).mockResolvedValue(0); // Movie doesn't exist

      const updateMovieDto: UpdateMovieDto = {
        name: 'Updated Movie',
        ageRestriction: 16,
      };

      await expect(
        service.update('nonexistent-id', updateMovieDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a movie by ID', async () => {
      (prisma.movie.delete as jest.Mock).mockResolvedValue({ id: '1' });

      const result = await service.remove('1');
      expect(prisma.movie.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toBeUndefined(); // Check that the service method doesn't return anything
    });

    it('should throw NotFoundException if movie not found during delete', async () => {
      (prisma.movie.delete as jest.Mock).mockRejectedValue(new Error());

      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('bulkRemove', () => {
    it('should bulk remove movies successfully', async () => {
      const movieIds = ['1', '2'];

      (prisma.movie.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });

      await service.bulkRemove(movieIds);
      expect(prisma.movie.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: movieIds } },
      });
    });

    it('should throw NotFoundException if some movies are not found during bulk delete', async () => {
      const movieIds = ['1', '2'];

      (prisma.movie.deleteMany as jest.Mock).mockResolvedValue({ count: 1 }); // Only 1 deleted

      await expect(service.bulkRemove(movieIds)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.movie.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: movieIds } },
      });
    });
  });
});
