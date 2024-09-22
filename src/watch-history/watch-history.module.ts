import { Module } from '@nestjs/common';
import { WatchHistoryService } from './services/watch-history.service';
import { WatchHistoryController } from './controllers/watch-history.controller';

@Module({
  providers: [WatchHistoryService],
  controllers: [WatchHistoryController]
})
export class WatchHistoryModule {}
