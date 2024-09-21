import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export class RoleNotfoundResponseType {
  @ApiProperty({ example: 'Role not found' })
  message: string;

  @ApiProperty({ example: 'Not found' })
  error: string;

  @ApiProperty({ example: HttpStatus.NOT_FOUND })
  statusCode: number;
}
