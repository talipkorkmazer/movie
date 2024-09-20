import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export class LoginUnauthorizedResponseType {
  @ApiProperty({ example: 'Sorry, the username or password is incorrect' })
  message: string;

  @ApiProperty({ example: 'Unauthorized' })
  error: string;

  @ApiProperty({ example: HttpStatus.UNAUTHORIZED })
  statusCode: number;
}
