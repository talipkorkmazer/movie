import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export class WatchHistoryNotfoundResponseType {
  @ApiProperty({ example: 'Watch history not found' })
  message: string;

  @ApiProperty({ example: 'Not found' })
  error: string;

  @ApiProperty({ example: HttpStatus.NOT_FOUND })
  statusCode: number;
}
