import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { DEFAULT_PAGE_SIZE } from '@/common/constants';

export class PaginationDto {
  @ApiProperty({ default: 1, required: false })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  readonly limit: number;

  @ApiProperty({ default: DEFAULT_PAGE_SIZE, required: false })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  readonly page: number;
}
