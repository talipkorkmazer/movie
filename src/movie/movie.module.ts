import { Module } from '@nestjs/common';
import { MovieService } from './services/movie.service';
import { MovieController } from './controllers/movie.controller';

@Module({
  providers: [MovieService],
  controllers: [MovieController],
})
export class MovieModule {}
