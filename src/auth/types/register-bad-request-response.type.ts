import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export class RegisterBadRequestResponseType {
  @ApiProperty({
    example: [
      'Username is required',
      'Password is required',
      'Age is required',
      'Role ID is required',
    ],
  })
  message: string[];

  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiProperty({ example: HttpStatus.BAD_REQUEST })
  statusCode: number;
}
