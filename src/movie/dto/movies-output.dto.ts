import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class MoviesOutputDto {
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

  @ApiProperty()
  @Type(() => Sessions)
  Sessions: Sessions[];
}

export class Sessions {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsDate()
  date: Date;

  @ApiProperty()
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
