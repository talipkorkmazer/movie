import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class RoleType {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsArray()
  Permissions: string[];
}

export class UserModel {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsNumber()
  age: number;

  @ApiProperty()
  @Type(() => RoleType)
  Role: RoleType;

  @ApiProperty()
  @IsNumber()
  iat?: number;

  @ApiProperty()
  @IsNumber()
  exp?: number;
}

export interface UserWithRolePermissions {
  id: string;
  username: string;
  age: number;
  Role: {
    name: string;
    Permissions: {
      permission: {
        name: string;
      };
    }[];
  };
}

export const PREDEFINED_ROLES = {
  MANAGER: 'Manager',
  CUSTOMER: 'Customer',
};
