import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuthModule } from '@auth/auth.module';
import { RoleModule } from '@role/role.module';
import { PermissionModule } from '@permission/permission.module';
import { MovieModule } from './movie/movie.module';
import { SessionModule } from './session/session.module';
import { TicketModule } from './ticket/ticket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    RoleModule,
    PermissionModule,
    MovieModule,
    SessionModule,
    TicketModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
