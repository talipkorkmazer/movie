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
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<SessionsOutputDto>> {
    const paginate = createPaginator(paginationDto);
    const include = {
      include: {
        Movie: true,
      },
    };

    return await paginate(this.prisma.session, include);
  }

  async find(id: string) {
    const session = this.prisma.session.findFirst({
      where: {
        id: id,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  async create(createSessionDto: CreateSessionDto) {
    const sessionExists = await this.prisma.session.count({
      where: {
        movieId: createSessionDto.movieId,
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
        movieId: createSessionDto.movieId,
        date: createSessionDto.date,
        timeSlot: createSessionDto.timeSlot,
        roomNumber: createSessionDto.roomNumber,
      },
    });
  }

  async update(
    id: string,
    updateSessionDto: UpdateSessionDto,
  ): Promise<SessionOutputDto> {
    const sessionExists = await this.prisma.session.count({
      where: {
        id: id,
      },
    });

    if (!sessionExists) {
      throw new NotFoundException('Session not found');
    }

    return this.prisma.session.update({
      where: {
        id: id,
      },
      data: {
        date: updateSessionDto.date,
        timeSlot: updateSessionDto.timeSlot,
        roomNumber: updateSessionDto.roomNumber,
      },
    });
  }

  async remove(id: string) {
    try {
      await this.prisma.session.delete({
        where: { id },
      });
    } catch (e) {
      console.log(e);
      throw new NotFoundException('Session not found');
    }
  }
}
