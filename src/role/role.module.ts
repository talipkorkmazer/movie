import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from '@/prisma/prisma.module';
import { RolesGuard } from '@role/guards/roles.guard';
import { RoleController } from './controllers/role.controller';
import { RoleService } from './services/role.service';

@Module({
  imports: [PrismaModule],
  controllers: [RoleController],
  providers: [
    RoleService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class RoleModule {}
