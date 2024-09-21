import { Module } from '@nestjs/common';
import { TicketController } from './controllers/ticket.controller';
import { TicketService } from './services/ticket.service';

@Module({
  controllers: [TicketController],
  providers: [TicketService],
})
export class TicketModule {}
