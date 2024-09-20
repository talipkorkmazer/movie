import { Module } from '@nestjs/common';
import { PermissionService } from '@permission/permission.service';
import { APP_GUARD } from '@nestjs/core';
import { PermissionsGuard } from '@permission/permissions.guard';
import { PermissionController } from '@permission/permission.controller';
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
