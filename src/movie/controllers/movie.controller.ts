import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody, ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiUnauthorizedResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { LoginUnauthorizedResponseType } from '@auth/types/login-unauthorized-response.type';
import { Permission } from '@permission/decorators/permissions.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { MovieService } from '@movie/services/movie.service';
import { CreateMovieDto } from '@movie/dto/create-movie.dto';
import { MovieOutputDto } from '@movie/dto/movie-output.dto';
import { UpdateMovieDto } from '@movie/dto/update-movie.dto';
import { MovieNotfoundResponseType } from '@movie/types/movie-notfound-response.type';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { MoviesOutputDto } from '@movie/dto/movies-output.dto';
import { PaginatedResult } from '@/common/types/paginated-result';
import { MovieConflictResponseType } from '@movie/types/movie-conflict-response.type';
import { MoviePaginationDto } from '@movie/dto/movie-pagination.dto';

@ApiTags('Movies')
@ApiUnauthorizedResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Unauthorized',
  type: LoginUnauthorizedResponseType,
})
@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @ApiOperation({ summary: 'Get all movies' })
  @ApiPaginatedResponse(MoviesOutputDto)
  @Get()
  @Permission('view:movies')
  findAll(
    @Query() paginationDto: MoviePaginationDto,
  ): Promise<PaginatedResult<MoviesOutputDto>> {
    return this.movieService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get a movie by id' })
  @ApiOkResponse({ type: MovieOutputDto })
  @ApiNotFoundResponse({
    description: 'Movie not found',
    type: MovieNotfoundResponseType,
    status: HttpStatus.NOT_FOUND,
  })
  @Get(':id')
  @Permission('view:movie')
  find(@Param('id') id: string): Promise<MovieOutputDto> {
    return this.movieService.find(id);
  }

  @ApiOperation({ summary: 'Create a movie' })
  @ApiOkResponse({ type: MovieOutputDto })
  @ApiConflictResponse({
    description: 'Movie already exists',
    type: MovieConflictResponseType,
    status: HttpStatus.CONFLICT,
  })
  @ApiBody({ type: CreateMovieDto })
  @Post()
  @Permission('create:movie')
  create(@Body() createMovieDto: CreateMovieDto): Promise<MovieOutputDto> {
    return this.movieService.create(createMovieDto);
  }

  @ApiOperation({ summary: 'Bulk create movies' })
  @ApiBody({ type: [CreateMovieDto] })
  @Post('bulk')
  @Permission('create:movie')
  async bulkCreate(@Body() movies: CreateMovieDto[]) {
    return this.movieService.bulkCreate(movies);
  }

  @ApiOperation({ summary: 'Update a movie' })
  @ApiOkResponse({ type: MovieOutputDto })
  @ApiNotFoundResponse({
    description: 'Movie not found',
    type: MovieNotfoundResponseType,
    status: HttpStatus.NOT_FOUND,
  })
  @Patch(':id')
  @Permission('update:movie')
  update(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto) {
    return this.movieService.update(id, updateMovieDto);
  }

  @ApiOperation({ summary: 'Bulk delete movies' })
  @ApiBody({ schema: { example: { ids: ['movieId1', 'movieId2'] } } })
  @Delete('bulk')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permission('delete:movie')
  async bulkRemove(@Body('ids') movieIds: string[]) {
    await this.movieService.bulkRemove(movieIds);
  }

  @ApiOperation({ summary: 'Delete a movie' })
  @ApiNotFoundResponse({
    description: 'Movie not found',
    type: MovieNotfoundResponseType,
    status: HttpStatus.NOT_FOUND,
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permission('delete:movie')
  remove(@Param('id') id: string): Promise<void> {
    return this.movieService.remove(id);
  }
}
