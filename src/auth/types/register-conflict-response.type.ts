import { ApiProperty } from '@nestjs/swagger';

export class RegisterConflictResponseType {
  @ApiProperty({ example: 'Username already exists' })
  message: string;

  @ApiProperty({ example: 'Conflict' })
  error: string;

  @ApiProperty({ example: 409 })
  statusCode: number;
}
