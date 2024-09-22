import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { CreateSessionDto } from '@session/dto/create-session.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { createPaginator } from '@/common/pagination.helper';
import { PaginatedResult } from '@/common/types/paginated-result';
import { SessionOutputDto } from '@session/dto/session-output.dto';
import { SessionsOutputDto } from '@session/dto/sessions-output.dto';
import { UpdateSessionDto } from '@session/dto/update-session.dto';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    movieId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<SessionsOutputDto>> {
    const paginate = createPaginator(paginationDto);
    const includeAndWhere = {
      include: {
        Movie: true,
      },
      where: {
        movieId,
      },
    };

    return await paginate(this.prisma.session, includeAndWhere);
  }

  async find(movieId: string, sessionId: string): Promise<SessionOutputDto> {
    const session = this.prisma.session.findFirst({
      where: {
        id: sessionId,
        movieId,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  async create(movieId: string, createSessionDto: CreateSessionDto) {
    const sessionExists = await this.prisma.session.count({
      where: {
        movieId: movieId,
        date: createSessionDto.date,
        timeSlot: createSessionDto.timeSlot,
        roomNumber: createSessionDto.roomNumber,
      },
    });

    if (sessionExists) {
      throw new ConflictException('Session already exists');
    }

    return this.prisma.session.create({
      data: {
        movieId: movieId,
        date: createSessionDto.date,
        timeSlot: createSessionDto.timeSlot,
        roomNumber: createSessionDto.roomNumber,
      },
    });
  }

  async update(
    movieId: string,
    sessionId: string,
    updateSessionDto: UpdateSessionDto,
  ): Promise<SessionOutputDto> {
    const sessionExists = await this.prisma.session.count({
      where: {
        id: sessionId,
        movieId,
      },
    });

    if (!sessionExists) {
      throw new NotFoundException('Session not found');
    }

    return this.prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        date: updateSessionDto.date,
        timeSlot: updateSessionDto.timeSlot,
        roomNumber: updateSessionDto.roomNumber,
      },
    });
  }

  async remove(movieId: string, sessionId: string) {
    try {
      await this.prisma.session.delete({
        where: { id: sessionId, movieId },
      });
    } catch (e) {
      console.log(e);
      throw new NotFoundException('Session not found');
    }
  }
}
