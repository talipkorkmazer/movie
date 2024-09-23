import { Controller, Get } from '@nestjs/common';
import { Public } from '@auth/metas/auth.meta';

@Controller()
export class AppController {
  @Public()
  @Get()
  index() {
    return [`Welcome to Movie`];
  }
}
