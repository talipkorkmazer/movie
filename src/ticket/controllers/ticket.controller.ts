import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiUnauthorizedResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { LoginUnauthorizedResponseType } from '@auth/types/login-unauthorized-response.type';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { Permission } from '@permission/decorators/permissions.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResult } from '@/common/types/paginated-result';
import { TicketService } from '@ticket/services/ticket.service';
import { TicketOutputDto } from '@ticket/dto/ticket-output.dto';
import { CreateTicketDto } from '@ticket/dto/create-ticket.dto';

@ApiTags('Tickets')
@ApiUnauthorizedResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Unauthorized',
  type: LoginUnauthorizedResponseType,
})
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @ApiOperation({ summary: 'Get all tickets' })
  @ApiPaginatedResponse(TicketOutputDto)
  @Get()
  @Permission('view:tickets')
  findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<TicketOutputDto>> {
    return this.ticketService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get a ticket by id' })
  @ApiOkResponse({ type: TicketOutputDto })
  @Get(':id')
  @Permission('view:ticket')
  find(@Param('id') id: string): Promise<TicketOutputDto> {
    return this.ticketService.find(id);
  }

  @ApiOperation({ summary: 'Create a ticket' })
  @ApiOkResponse({ type: TicketOutputDto })
  @ApiBody({ type: CreateTicketDto })
  @Post()
  @Permission('create:ticket')
  create(@Body() createTicketDto: CreateTicketDto): Promise<TicketOutputDto> {
    return this.ticketService.create(createTicketDto);
  }
}
