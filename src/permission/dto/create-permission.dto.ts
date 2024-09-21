import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  roleIds: string[];
}
