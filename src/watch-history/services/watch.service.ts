import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UserModel } from '@auth/models/auth.model';
import { WatchHistoryOutputDto } from '@/watch-history/dto/watch-history-output.dto';

@Injectable()
export class WatchService {
  public select = {
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

  async create(
    movieId: string,
    sessionId: string,
  ): Promise<WatchHistoryOutputDto> {
    await this.checkMovieAndSessionExistence(movieId, sessionId);

    const { id } = this.getCurrentUser();
    // Check if user has a ticket for the session
    const getTicketIfExists = await this.prisma.ticket.findFirst({
      where: {
        userId: id,
        sessionId,
        isUsed: false,
      },
      select: {
        id: true,
      },
    });
    if (!getTicketIfExists) {
      throw new UnauthorizedException(
        'User does not have a ticket for this session',
      );
    }

    await this.prisma.ticket.update({
      where: {
        id: getTicketIfExists.id,
      },
      data: {
        isUsed: true,
      },
    });

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
