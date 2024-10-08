import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMovieDto } from '@movie/dto/create-movie.dto';
import { UpdateMovieDto } from '@movie/dto/update-movie.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { createPaginator } from '@/common/pagination.helper';
import { PaginatedResult } from '@/common/types/paginated-result';
import { MoviesOutputDto } from '@movie/dto/movies-output.dto';
import { MovieOutputDto } from '@movie/dto/movie-output.dto';
import { MoviePaginationDto } from '@movie/dto/movie-pagination.dto';

@Injectable()
export class MovieService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    paginationDto: MoviePaginationDto,
  ): Promise<PaginatedResult<MoviesOutputDto>> {
    const { sortBy, order, name, ageRestriction } = paginationDto;
    const paginate = createPaginator(paginationDto);

    const where = {
      ...(name && { name: { contains: name } }),
      ...(ageRestriction && { ageRestriction }),
    };

    // Sorting logic
    const orderBy = sortBy ? { [sortBy]: order } : {};

    const includeFilterSort = {
      include: {
        Sessions: true,
      },
      where,
      orderBy,
    };

    return await paginate(this.prisma.movie, includeFilterSort);
  }

  async find(id: string) {
    const movie = await this.prisma.movie.findFirst({
      where: {
        id: id,
      },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    return movie;
  }

  async create(createMovieDto: CreateMovieDto): Promise<MovieOutputDto> {
    const movieExists = await this.prisma.movie.count({
      where: {
        name: createMovieDto.name,
      },
    });
    if (movieExists) {
      throw new ConflictException('Movie already exists');
    }

    return this.prisma.movie.create({
      data: {
        name: createMovieDto.name,
        ageRestriction: createMovieDto.ageRestriction,
      },
    });
  }

  async bulkCreate(movies: CreateMovieDto[]): Promise<MovieOutputDto[]> {
    await this.prisma.movie.createMany({
      data: movies,
      skipDuplicates: true,
    });

    return this.prisma.movie.findMany({
      where: {
        name: { in: movies.map(movie => movie.name) },
      },
    });
  }

  async update(
    id: string,
    updateMovieDto: UpdateMovieDto,
  ): Promise<MovieOutputDto> {
    const movieExists = await this.prisma.movie.count({
      where: {
        id: id,
      },
    });

    if (!movieExists) {
      throw new NotFoundException('Movie not found');
    }

    return this.prisma.movie.update({
      where: {
        id: id,
      },
      data: {
        name: updateMovieDto.name,
        ageRestriction: updateMovieDto.ageRestriction,
      },
    });
  }

  async remove(id: string) {
    try {
      await this.prisma.movie.delete({
        where: { id },
      });
    } catch (e) {
      throw new NotFoundException('Movie not found');
    }
  }

  async bulkRemove(movieIds: string[]): Promise<void> {
    const deletedCount = await this.prisma.movie.deleteMany({
      where: {
        id: { in: movieIds },
      },
    });

    if (deletedCount.count !== movieIds.length) {
      throw new NotFoundException('Some movies not found');
    }
  }
}
