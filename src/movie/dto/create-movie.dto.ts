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
import { TimeSlots } from '@session/dto/create-session.dto';

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
  @IsDate()
  @Type(() => Date)
  date: string;

  @IsString()
  @IsIn(TimeSlots, {
    message: `Time slot must be one of the following: ${TimeSlots.join(', ')}`,
  })
  timeSlot: string;

  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  roomNumber: number;
}
