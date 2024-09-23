import { Module } from '@nestjs/common';
import { WatchHistoryService } from './services/watch-history.service';
import { WatchController } from './controllers/watch.controller';
import { WatchHistoryController } from '@watch-history/controllers/watch-history.controller';

@Module({
  providers: [WatchHistoryService],
  controllers: [WatchController, WatchHistoryController],
})
export class WatchHistoryModule {}
