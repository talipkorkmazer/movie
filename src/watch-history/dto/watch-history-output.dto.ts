import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { TimeSlots } from '@session/dto/create-session.dto';

export class User {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsNumber()
  age: number;
}

export class Movie {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  ageRestriction: number;

  @ApiProperty()
  @IsDate()
  updatedAt: Date;

  @ApiProperty()
  @IsDate()
  createdAt: Date;
}

export class Session {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsDate()
  date: Date;

  @ApiProperty({
    type: [String],
    'x-enumNames': TimeSlots,
    example: TimeSlots[0],
    examples: TimeSlots,
  })
  @IsString()
  timeSlot: string;

  @ApiProperty()
  @IsNumber()
  roomNumber: number;

  @ApiProperty()
  @IsDate()
  updatedAt: Date;

  @ApiProperty()
  @IsDate()
  createdAt: Date;
}

export class WatchHistoryOutputDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsDate()
  watchedAt: Date;

  @ApiProperty({ type: [User] })
  @Type(() => User)
  User: User;

  @ApiProperty({ type: [Movie] })
  @Type(() => Movie)
  Movie: Movie;

  @ApiProperty({ type: [Session] })
  @Type(() => Session)
  Session: Session;
}
