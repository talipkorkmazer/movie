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
import { WatchHistoryOutputDto } from '@/watch-history/dto/watch-history-output.dto';

@Injectable()
export class WatchHistoryService {
  private select = {
    id: true,
    watchedAt: true,
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
      },
    },
    Movie: {
      select: {
        id: true,
        name: true,
        ageRestriction: true,
        updatedAt: true,
        createdAt: true,
      },
    },
  };

  constructor(
    private prisma: PrismaService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async findAll(
    movieId: string,
    sessionId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<WatchHistoryOutputDto>> {
    await this.checkMovieAndSessionExistence(movieId, sessionId);

    const { id } = this.getCurrentUser();
    const paginate = createPaginator(paginationDto);
    const select = {
      where: {
        sessionId,
        movieId,
        userId: id,
      },
      select: this.select,
    };

    return await paginate(this.prisma.watchHistory, select);
  }

  async find(
    movieId: string,
    sessionId: string,
    ticketId: string,
  ): Promise<WatchHistoryOutputDto> {
    await this.checkMovieAndSessionExistence(movieId, sessionId);

    const { id } = this.getCurrentUser();
    const watchHistory = this.prisma.watchHistory.findFirst({
      where: {
        id: ticketId,
        userId: id,
      },
      select: this.select,
    });

    if (!watchHistory) {
      throw new NotFoundException('Watch history not found');
    }

    return watchHistory;
  }

  async create(
    movieId: string,
    sessionId: string,
  ): Promise<WatchHistoryOutputDto> {
    await this.checkMovieAndSessionExistence(movieId, sessionId);

    const { id } = this.getCurrentUser();
    return this.prisma.watchHistory.create({
      data: {
        userId: id,
        sessionId,
        movieId,
      },
      select: this.select,
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
