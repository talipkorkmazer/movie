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
    movieId: string,
    sessionId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<TicketOutputDto>> {
    await this.checkMovieAndSessionExistence(movieId, sessionId);

    const { id } = this.getCurrentUser();
    const paginate = createPaginator(paginationDto);
    const select = {
      where: {
        sessionId,
        userId: id,
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
    };

    return await paginate(this.prisma.ticket, select);
  }

  async find(
    movieId: string,
    sessionId: string,
    ticketId: string,
  ): Promise<TicketOutputDto> {
    await this.checkMovieAndSessionExistence(movieId, sessionId);

    const { id } = this.getCurrentUser();
    const ticket = this.prisma.ticket.findFirst({
      where: {
        id: ticketId,
        userId: id,
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

  async create(movieId: string, sessionId: string): Promise<TicketOutputDto> {
    await this.checkMovieAndSessionExistence(movieId, sessionId);

    const { id } = this.getCurrentUser();
    return this.prisma.ticket.create({
      data: {
        userId: id,
        sessionId: sessionId,
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

  private async checkMovieAndSessionExistence(
    movieId: string,
    sessionId: string,
  ) {
    const isMovieExists = await this.prisma.movie.count({
      where: { id: movieId },
    });

    if (!isMovieExists) {
      throw new NotFoundException('Movie not found');
    }

    const isSessionExists = await this.prisma.session.count({
      where: { id: sessionId },
    });

    if (!isSessionExists) {
      throw new NotFoundException('Session not found');
    }
  }
}
