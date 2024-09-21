import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  readonly limit: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  readonly page: number;
}
