import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RolesOutputDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsDate()
  updatedAt: Date;

  @ApiProperty()
  @IsDate()
  createdAt: Date;

  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => Permission)
  Permissions: Permission[];
}

export class Permission {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsDate()
  updatedAt: Date;

  @ApiProperty()
  @IsDate()
  createdAt: Date;
}
