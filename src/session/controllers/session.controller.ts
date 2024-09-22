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
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { PaginatedResult } from '@/common/types/paginated-result';
import { SessionService } from '@session/services/session.service';
import { SessionsOutputDto } from '@session/dto/sessions-output.dto';
import { SessionOutputDto } from '@session/dto/session-output.dto';
import { CreateSessionDto } from '@session/dto/create-session.dto';
import { UpdateSessionDto } from '@session/dto/update-session.dto';
import { SessionNotfoundResponseType } from '@session/types/session-notfound-response.type';
import { SessionConflictResponseType } from '@session/types/session-conflict-response.type';

@ApiTags('Sessions')
@ApiUnauthorizedResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Unauthorized',
  type: LoginUnauthorizedResponseType,
})
@Controller('movies/:movieId/sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @ApiOperation({ summary: 'Get all sessions' })
  @ApiPaginatedResponse(SessionsOutputDto)
  @Get()
  @Permission('view:sessions')
  findAll(
    @Param('movieId') movieId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<SessionsOutputDto>> {
    return this.sessionService.findAll(movieId, paginationDto);
  }

  @ApiOperation({ summary: 'Get a session by id' })
  @ApiOkResponse({ type: SessionOutputDto })
  @ApiNotFoundResponse({
    description: 'Session not found',
    type: SessionNotfoundResponseType,
    status: HttpStatus.NOT_FOUND,
  })
  @Get(':sessionId')
  @Permission('view:session')
  find(
    @Param('movieId') movieId: string,
    @Param('sessionId') sessionId: string,
  ): Promise<SessionOutputDto> {
    return this.sessionService.find(movieId, sessionId);
  }

  @ApiOperation({ summary: 'Create a session' })
  @ApiOkResponse({ type: SessionOutputDto })
  @ApiConflictResponse({
    description: 'Session already exists',
    type: SessionConflictResponseType,
    status: HttpStatus.CONFLICT,
  })
  @ApiBody({ type: CreateSessionDto })
  @Post()
  @Permission('create:session')
  create(
    @Param('movieId') movieId: string,
    @Body() createSessionDto: CreateSessionDto,
  ): Promise<SessionOutputDto> {
    return this.sessionService.create(movieId, createSessionDto);
  }

  @ApiOperation({ summary: 'Update a session' })
  @ApiOkResponse({ type: SessionOutputDto })
  @ApiNotFoundResponse({
    description: 'Session not found',
    type: SessionNotfoundResponseType,
    status: HttpStatus.NOT_FOUND,
  })
  @Patch(':sessionId')
  @Permission('update:session')
  update(
    @Param('movieId') movieId: string,
    @Param('sessionId') sessionId: string,
    @Body() updateSessionDto: UpdateSessionDto,
  ) {
    return this.sessionService.update(movieId, sessionId, updateSessionDto);
  }

  @ApiOperation({ summary: 'Delete a session' })
  @ApiNotFoundResponse({
    description: 'Session not found',
    type: SessionNotfoundResponseType,
    status: HttpStatus.NOT_FOUND,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':sessionId')
  @Permission('delete:session')
  remove(
    @Param('movieId') movieId: string,
    @Param('sessionId') sessionId: string,
  ): Promise<void> {
    return this.sessionService.remove(movieId, sessionId);
  }
}
