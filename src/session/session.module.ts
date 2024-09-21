import { Module } from '@nestjs/common';
import { SessionService } from '@session/services/session.service';
import { SessionController } from '@session/controllers/session.controller';

@Module({
  providers: [SessionService],
  controllers: [SessionController],
})
export class SessionModule {}
