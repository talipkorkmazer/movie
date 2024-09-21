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
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { PaginatedResult } from '@/common/types/paginated-result';
import { SessionService } from '@session/services/session.service';
import { SessionsOutputDto } from '@session/dto/sessions-output.dto';
import { SessionOutputDto } from '@session/dto/session-output.dto';
import { CreateSessionDto } from '@session/dto/create-session.dto';
import { UpdateSessionDto } from '@session/dto/update-session.dto';
import { SessionNotfoundResponseType } from '@session/types/session-notfound-response.type';

@ApiTags('Sessions')
@ApiUnauthorizedResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Unauthorized',
  type: LoginUnauthorizedResponseType,
})
@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @ApiOperation({ summary: 'Get all sessions' })
  @ApiPaginatedResponse(SessionsOutputDto)
  @Get()
  @Permission('view:sessions')
  findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<SessionsOutputDto>> {
    return this.sessionService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get a session by id' })
  @ApiOkResponse({ type: SessionOutputDto })
  @Get(':id')
  @Permission('view:session')
  find(@Param('id') id: string): Promise<SessionOutputDto> {
    return this.sessionService.find(id);
  }

  @ApiOperation({ summary: 'Create a session' })
  @ApiOkResponse({ type: SessionOutputDto })
  @ApiBody({ type: CreateSessionDto })
  @Post()
  @Permission('create:session')
  create(
    @Body() createSessionDto: CreateSessionDto,
  ): Promise<SessionOutputDto> {
    return this.sessionService.create(createSessionDto);
  }

  @ApiOperation({ summary: 'Update a session' })
  @ApiOkResponse({ type: SessionOutputDto })
  @Patch(':id')
  @Permission('update:session')
  update(@Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto) {
    return this.sessionService.update(id, updateSessionDto);
  }

  @ApiOperation({ summary: 'Delete a session' })
  @ApiNotFoundResponse({
    description: 'Session not found',
    type: SessionNotfoundResponseType,
    status: HttpStatus.NOT_FOUND,
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permission('delete:session')
  remove(@Param('id') id: string): Promise<void> {
    return this.sessionService.remove(id);
  }
}
