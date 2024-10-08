import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuthModule } from '@auth/auth.module';
import { RoleModule } from '@role/role.module';
import { PermissionModule } from '@permission/permission.module';
import { MovieModule } from '@movie/movie.module';
import { SessionModule } from '@session/session.module';
import { TicketModule } from '@ticket/ticket.module';
import { WatchHistoryModule } from '@/watch-history/watch-history.module';
import { AppController } from '@/app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    RoleModule,
    PermissionModule,
    MovieModule,
    SessionModule,
    TicketModule,
    WatchHistoryModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
