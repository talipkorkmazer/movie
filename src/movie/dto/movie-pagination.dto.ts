import { PaginationDto } from '@/common/dto/pagination.dto';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class MoviePaginationDto extends PaginationDto {
  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.ASC;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  ageRestriction?: number;
}
