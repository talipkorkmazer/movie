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
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiUnauthorizedResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { LoginUnauthorizedResponseType } from '@auth/types/login-unauthorized-response.type';
import { Permission } from '@permission/decorators/permissions.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { MovieService } from '@/movie/services/movie.service';
import { CreateMovieDto } from '@/movie/dto/create-movie.dto';
import { MovieOutputDto } from '@/movie/dto/movie-output.dto';
import { UpdateMovieDto } from '@/movie/dto/update-movie.dto';
import { MovieNotfoundResponseType } from '@/movie/types/movie-notfound-response.type';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { MoviesOutputDto } from '@/movie/dto/movies-output.dto';
import { PaginatedResult } from '@/common/types/paginated-result';

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
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<MoviesOutputDto>> {
    return this.movieService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get a movie by id' })
  @ApiOkResponse({ type: MovieOutputDto })
  @Get(':id')
  @Permission('view:movie')
  find(@Param('id') id: string): Promise<MovieOutputDto> {
    return this.movieService.find(id);
  }

  @ApiOperation({ summary: 'Create a movie' })
  @ApiOkResponse({ type: MovieOutputDto })
  @ApiBody({ type: CreateMovieDto })
  @Post()
  @Permission('create:movie')
  create(@Body() createMovieDto: CreateMovieDto): Promise<MovieOutputDto> {
    return this.movieService.create(createMovieDto);
  }

  @ApiOperation({ summary: 'Update a movie' })
  @ApiOkResponse({ type: MovieOutputDto })
  @Patch(':id')
  @Permission('update:movie')
  update(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto) {
    return this.movieService.update(id, updateMovieDto);
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
