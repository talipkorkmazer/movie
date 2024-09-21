import { IsDate, IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export const TimeSlots = [
  '10:00-12:00',
  '12:00-14:00',
  '14:00-16:00',
  '16:00-18:00',
  '18:00-20:00',
  '20:00-22:00',
  '22:00-00:00',
];

export class CreateSessionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  date: string;

  @ApiProperty()
  @IsString()
  @IsIn(TimeSlots, {
    message: `Time slot must be one of the following: ${TimeSlots.join(', ')}`,
  })
  timeSlot: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  roomNumber: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  movieId: string;
}
