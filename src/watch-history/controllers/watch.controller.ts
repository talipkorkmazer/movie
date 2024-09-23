import { Controller, HttpStatus, Param, Post } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiUnauthorizedResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { LoginUnauthorizedResponseType } from '@auth/types/login-unauthorized-response.type';
import { Permission } from '@permission/decorators/permissions.decorator';
import { WatchHistoryOutputDto } from '@/watch-history/dto/watch-history-output.dto';
import { SessionNotfoundResponseType } from '@session/types/session-notfound-response.type';
import { MovieNotfoundResponseType } from '@movie/types/movie-notfound-response.type';
import { WatchService } from '@watch-history/services/watch.service';

@ApiTags('Watch Histories')
@ApiUnauthorizedResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Unauthorized',
  type: LoginUnauthorizedResponseType,
})
@Controller('movies/:movieId/sessions/:sessionId/watch')
export class WatchController {
  constructor(private readonly watchService: WatchService) {}

  @ApiOperation({ summary: 'Watch a movie' })
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
  @Post()
  @Permission('create:watch-history')
  create(
    @Param('movieId') movieId: string,
    @Param('sessionId') sessionId: string,
  ): Promise<WatchHistoryOutputDto> {
    return this.watchService.create(movieId, sessionId);
  }
}
