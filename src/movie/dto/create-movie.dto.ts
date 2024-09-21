import {
  IsDate,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
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

export class CreateMovieDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  ageRestriction: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Session)
  sessions: Session[];
}

export class Session {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsDate({
    message: 'Date must be a valid date',
  })
  @Type(() => Date)
  date: string;

  @IsString() // Ensures it's a string type
  @IsIn(TimeSlots, {
    message: `Time slot must be one of the following: ${TimeSlots.join(', ')}`,
  })
  timeSlot: string;

  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  roomNumber: number;
}
