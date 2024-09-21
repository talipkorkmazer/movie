import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: ['a772a638-7dcb-41b5-9de3-6e127af7b81a'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  roleIds: string[];
}
