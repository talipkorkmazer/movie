import { Test, TestingModule } from '@nestjs/testing';
import { MovieController } from './movie.controller';
import { MovieService } from '../services/movie.service';
import { CreateMovieDto } from '../dto/create-movie.dto';
import { UpdateMovieDto } from '../dto/update-movie.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { NotFoundException } from '@nestjs/common';

describe('MovieController', () => {
  let controller: MovieController;
  let service: MovieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieController],
      providers: [
        {
          provide: MovieService,
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

    controller = module.get<MovieController>(MovieController);
    service = module.get<MovieService>(MovieService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return a paginated result of movies', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const paginatedMovies = {
        data: [{ id: '1', name: 'Movie 1', Sessions: [] }],
      };

      (service.findAll as jest.Mock).mockResolvedValue(paginatedMovies);

      const result = await controller.findAll(paginationDto);
      expect(result).toEqual(paginatedMovies);
      expect(service.findAll).toHaveBeenCalledWith(paginationDto);
    });
  });

  describe('find', () => {
    it('should return a movie by ID', async () => {
      const movie = { id: '1', name: 'Movie 1' };

      (service.find as jest.Mock).mockResolvedValue(movie);

      const result = await controller.find('1');
      expect(result).toEqual(movie);
      expect(service.find).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if the movie is not found', async () => {
      (service.find as jest.Mock).mockRejectedValue(new NotFoundException());

      await expect(controller.find('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(service.find).toHaveBeenCalledWith('nonexistent-id');
    });
  });

  describe('create', () => {
    it('should create and return a new movie', async () => {
      const createMovieDto: CreateMovieDto = {
        name: 'New Movie',
        ageRestriction: 13,
      };
      const createdMovie = { id: '1', ...createMovieDto };

      (service.create as jest.Mock).mockResolvedValue(createdMovie);

      const result = await controller.create(createMovieDto);
      expect(result).toEqual(createdMovie);
      expect(service.create).toHaveBeenCalledWith(createMovieDto);
    });
  });

  describe('update', () => {
    it('should update and return the movie', async () => {
      const updateMovieDto: UpdateMovieDto = {
        name: 'Updated Movie',
        ageRestriction: 16,
      };
      const updatedMovie = { id: '1', ...updateMovieDto };

      (service.update as jest.Mock).mockResolvedValue(updatedMovie);

      const result = await controller.update('1', updateMovieDto);
      expect(result).toEqual(updatedMovie);
      expect(service.update).toHaveBeenCalledWith('1', updateMovieDto);
    });

    it('should throw NotFoundException if the movie is not found', async () => {
      const updateMovieDto: UpdateMovieDto = {
        name: 'Updated Movie',
        ageRestriction: 16,
      };

      (service.update as jest.Mock).mockRejectedValue(new NotFoundException());

      await expect(
        controller.update('nonexistent-id', updateMovieDto),
      ).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith(
        'nonexistent-id',
        updateMovieDto,
      );
    });
  });

  describe('remove', () => {
    it('should delete a movie by ID', async () => {
      (service.remove as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.remove('1');
      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if the movie is not found', async () => {
      (service.remove as jest.Mock).mockRejectedValue(new NotFoundException());

      await expect(controller.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(service.remove).toHaveBeenCalledWith('nonexistent-id');
    });
  });
});
