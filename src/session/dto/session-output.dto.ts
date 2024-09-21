import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class SessionOutputDto {
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
