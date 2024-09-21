import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResult } from '@/common/types/paginated-result';
import { createPaginator } from '@/common/pagination.helper';
import { TicketOutputDto } from '@ticket/dto/ticket-output.dto';
import { CreateTicketDto } from '@ticket/dto/create-ticket.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UserModel } from '@auth/models/auth.model';

@Injectable()
export class TicketService {
  constructor(
    private prisma: PrismaService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<TicketOutputDto>> {
    const paginate = createPaginator(paginationDto);
    const select = {
      select: {
        id: true,
        purchaseDate: true,
        User: {
          select: {
            id: true,
            username: true,
            age: true,
          },
        },
        Session: {
          select: {
            id: true,
            date: true,
            timeSlot: true,
            roomNumber: true,
            updatedAt: true,
            createdAt: true,
            Movie: {
              select: {
                id: true,
                name: true,
                ageRestriction: true,
                updatedAt: true,
                createdAt: true,
              },
            },
          },
        },
      },
    };

    return await paginate(this.prisma.ticket, select);
  }

  async find(id: string): Promise<TicketOutputDto> {
    const ticket = this.prisma.ticket.findFirst({
      where: {
        id: id,
      },
      select: {
        id: true,
        purchaseDate: true,
        User: {
          select: {
            id: true,
            username: true,
            age: true,
          },
        },
        Session: {
          select: {
            id: true,
            date: true,
            timeSlot: true,
            roomNumber: true,
            updatedAt: true,
            createdAt: true,
            Movie: {
              select: {
                id: true,
                name: true,
                ageRestriction: true,
                updatedAt: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async create(createTicketDto: CreateTicketDto): Promise<TicketOutputDto> {
    return this.prisma.ticket.create({
      data: {
        userId: this.getCurrentUser().id,
        sessionId: createTicketDto.sessionId,
      },
      select: {
        id: true,
        purchaseDate: true,
        User: {
          select: {
            id: true,
            username: true,
            age: true,
          },
        },
        Session: {
          select: {
            id: true,
            date: true,
            timeSlot: true,
            roomNumber: true,
            updatedAt: true,
            createdAt: true,
            Movie: {
              select: {
                id: true,
                name: true,
                ageRestriction: true,
                updatedAt: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });
  }

  private getCurrentUser() {
    if (!this.request.user) {
      throw new UnauthorizedException('User not found.');
    }

    return this.request.user as UserModel;
  }
}
