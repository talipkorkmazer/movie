import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { CreateMovieDto } from '@movie/dto/create-movie.dto';
import { UpdateMovieDto } from '@movie/dto/update-movie.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { createPaginator } from '@/common/pagination.helper';
import { PaginatedResult } from '@/common/types/paginated-result';
import { MoviesOutputDto } from '@movie/dto/movies-output.dto';
import { MovieOutputDto } from '@movie/dto/movie-output.dto';

@Injectable()
export class MovieService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<MoviesOutputDto>> {
    const paginate = createPaginator(paginationDto);
    const include = {
      include: {
        Sessions: true,
      },
    };

    return await paginate(this.prisma.movie, include);
  }

  async find(id: string) {
    const movie = this.prisma.movie.findFirst({
      where: {
        id: id,
      },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    return movie;
  }

  async create(createMovieDto: CreateMovieDto) {
    const movieExists = await this.prisma.movie.count({
      where: {
        name: createMovieDto.name,
      },
    });
    if (movieExists) {
      throw new ConflictException('Movie already exists');
    }

    const movie = await this.prisma.movie.create({
      data: {
        name: createMovieDto.name,
        ageRestriction: createMovieDto.ageRestriction,
      },
    });

    if (createMovieDto.sessions && createMovieDto.sessions.length > 0) {
      await this.prisma.session.createMany({
        data: createMovieDto.sessions.map(session => ({
          movieId: movie.id,
          ...session,
        })),
      });
    }

    return movie;
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

    const movie = await this.prisma.movie.update({
      where: {
        id: id,
      },
      data: {
        name: updateMovieDto.name,
        ageRestriction: updateMovieDto.ageRestriction,
      },
    });

    if (updateMovieDto.sessions && updateMovieDto.sessions.length > 0) {
      await this.prisma.session.createMany({
        data: updateMovieDto.sessions.map(session => ({
          movieId: movie.id,
          ...session,
        })),
        skipDuplicates: true,
      });
    }

    return movie;
  }

  async remove(id: string) {
    try {
      await this.prisma.movie.delete({
        where: { id },
      });
    } catch (e) {
      console.log(e);
      throw new NotFoundException('Movie not found');
    }
  }
}
