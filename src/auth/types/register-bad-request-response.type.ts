import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ example: 400 })
  statusCode: number;
}
