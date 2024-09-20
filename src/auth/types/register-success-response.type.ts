import { ApiProperty } from '@nestjs/swagger';

export class RegisterSuccessResponseType {
  @ApiProperty()
  token: string;
}
