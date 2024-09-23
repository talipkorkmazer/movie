import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiUnauthorizedResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { LoginUnauthorizedResponseType } from '@auth/types/login-unauthorized-response.type';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { Permission } from '@permission/decorators/permissions.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResult } from '@/common/types/paginated-result';
import { WatchHistoryService } from '@/watch-history/services/watch-history.service';
import { WatchHistoryOutputDto } from '@/watch-history/dto/watch-history-output.dto';
import { SessionNotfoundResponseType } from '@session/types/session-notfound-response.type';
import { MovieNotfoundResponseType } from '@movie/types/movie-notfound-response.type';
import { WatchHistoryNotfoundResponseType } from '@/watch-history/types/watch-history-notfound-response.type';

@ApiTags('Watch Histories')
@ApiUnauthorizedResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Unauthorized',
  type: LoginUnauthorizedResponseType,
})
@Controller('watch-history')
export class WatchHistoryController {
  constructor(private readonly watchHistoryService: WatchHistoryService) {}

  @ApiOperation({ summary: 'Get all watch histories' })
  @ApiPaginatedResponse(WatchHistoryOutputDto)
  @ApiNotFoundResponse({
    description: 'Session not found',
    type: SessionNotfoundResponseType,
    status: HttpStatus.NOT_FOUND,
  })
  @ApiNotFoundResponse({
    description: 'Movie not found',
    type: MovieNotfoundResponseType,
    status: HttpStatus.NOT_FOUND,
  })
  @Get()
  @Permission('view:watch-histories')
  findAll(
    @Param('movieId') movieId: string,
    @Param('sessionId') sessionId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<WatchHistoryOutputDto>> {
    return this.watchHistoryService.findAll(movieId, sessionId, paginationDto);
  }

  @ApiOperation({ summary: 'Get a watch history by id' })
  @ApiOkResponse({ type: WatchHistoryOutputDto })
  @ApiNotFoundResponse({
    description: 'Session not found',
    type: SessionNotfoundResponseType,
    status: HttpStatus.NOT_FOUND,
  })
  @ApiNotFoundResponse({
    description: 'Movie not found',
    type: MovieNotfoundResponseType,
    status: HttpStatus.NOT_FOUND,
  })
  @ApiNotFoundResponse({
    description: 'Watch history not found',
    type: WatchHistoryNotfoundResponseType,
    status: HttpStatus.NOT_FOUND,
  })
  @Get(':watchHistoryId')
  @Permission('view:watch-history')
  find(
    @Param('movieId') movieId: string,
    @Param('sessionId') sessionId: string,
    @Param('watchHistoryId') watchHistoryId: string,
  ): Promise<WatchHistoryOutputDto> {
    return this.watchHistoryService.find(movieId, sessionId, watchHistoryId);
  }
}
