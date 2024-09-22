import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiConflictResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiUnauthorizedResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { LoginUnauthorizedResponseType } from '@auth/types/login-unauthorized-response.type';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { Permission } from '@permission/decorators/permissions.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResult } from '@/common/types/paginated-result';
import { TicketService } from '@ticket/services/ticket.service';
import { TicketOutputDto } from '@ticket/dto/ticket-output.dto';
import { TicketNotfoundResponseType } from '@ticket/types/ticket-notfound-response.type';
import { TicketConflictResponseType } from '@ticket/types/ticket-conflict-response.type';

@ApiTags('Tickets')
@ApiUnauthorizedResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Unauthorized',
  type: LoginUnauthorizedResponseType,
})
@Controller('movies/:movieId/sessions/:sessionId/tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @ApiOperation({ summary: 'Get all tickets' })
  @ApiPaginatedResponse(TicketOutputDto)
  @Get()
  @Permission('view:tickets')
  findAll(
    @Param('movieId') movieId: string,
    @Param('sessionId') sessionId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<TicketOutputDto>> {
    return this.ticketService.findAll(movieId, sessionId, paginationDto);
  }

  @ApiOperation({ summary: 'Get a ticket by id' })
  @ApiOkResponse({ type: TicketOutputDto })
  @ApiNotFoundResponse({
    description: 'Ticket not found',
    type: TicketNotfoundResponseType,
    status: HttpStatus.NOT_FOUND,
  })
  @Get(':ticketId')
  @Permission('view:ticket')
  find(
    @Param('movieId') movieId: string,
    @Param('sessionId') sessionId: string,
    @Param('ticketId') ticketId: string,
  ): Promise<TicketOutputDto> {
    return this.ticketService.find(movieId, sessionId, ticketId);
  }

  @ApiOperation({ summary: 'Create a ticket' })
  @ApiOkResponse({ type: TicketOutputDto })
  @ApiConflictResponse({
    description: 'Movie already exists',
    type: TicketConflictResponseType,
    status: HttpStatus.CONFLICT,
  })
  @Post()
  @Permission('create:ticket')
  create(
    @Param('movieId') movieId: string,
    @Param('sessionId') sessionId: string,
  ): Promise<TicketOutputDto> {
    return this.ticketService.create(movieId, sessionId);
  }
}
