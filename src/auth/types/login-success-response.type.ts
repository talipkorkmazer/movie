import { ApiProperty } from '@nestjs/swagger';

export class LoginSuccessResponseType {
  @ApiProperty()
  token: string;
}
