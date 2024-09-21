import { Module } from '@nestjs/common';
import { PermissionService } from '@permission/services/permission.service';
import { APP_GUARD } from '@nestjs/core';
import { PermissionsGuard } from '@permission/guards/permissions.guard';
import { PermissionController } from '@permission/controllers/permission.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    PermissionService,
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
  controllers: [PermissionController],
})
export class PermissionModule {}
