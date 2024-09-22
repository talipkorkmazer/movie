import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiUnauthorizedResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { LoginUnauthorizedResponseType } from '@auth/types/login-unauthorized-response.type';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { Permission } from '@permission/decorators/permissions.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResult } from '@/common/types/paginated-result';
import { WatchHistoryService } from '@/watch-history/services/watch-history.service';
import { WatchHistoryOutputDto } from '@/watch-history/dto/watch-history-output.dto';

@ApiTags('Watch Histories')
@ApiUnauthorizedResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Unauthorized',
  type: LoginUnauthorizedResponseType,
})
@Controller('movies/:movieId/sessions/:sessionId/watch')
export class WatchHistoryController {
  constructor(private readonly watchHistoryService: WatchHistoryService) {}

  @ApiOperation({ summary: 'Get all watch histories' })
  @ApiPaginatedResponse(WatchHistoryOutputDto)
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
  @Get(':watchHistoryId')
  @Permission('view:watch-history')
  find(
    @Param('movieId') movieId: string,
    @Param('sessionId') sessionId: string,
    @Param('watchHistoryId') watchHistoryId: string,
  ): Promise<WatchHistoryOutputDto> {
    return this.watchHistoryService.find(movieId, sessionId, watchHistoryId);
  }

  @ApiOperation({ summary: 'Watch a movie' })
  @ApiOkResponse({ type: WatchHistoryOutputDto })
  @Post()
  @Permission('create:watch-history')
  create(
    @Param('movieId') movieId: string,
    @Param('sessionId') sessionId: string,
  ): Promise<WatchHistoryOutputDto> {
    return this.watchHistoryService.create(movieId, sessionId);
  }
}
