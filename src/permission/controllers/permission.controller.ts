import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Permission } from '@permission/decorators/permissions.decorator';
import { PermissionService } from '@permission/services/permission.service';
import { UpdatePermissionDto } from '@permission/dto/update-permission.dto';
import { CreatePermissionDto } from '@permission/dto/create-permission.dto';

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get('')
  @Permission('view:permissions')
  findAll() {
    return this.permissionService.findAll();
  }

  @Get(':id')
  @Permission('view:permission')
  find(@Param('id') id: string) {
    return this.permissionService.find(id);
  }

  @Post()
  @Permission('create:permission')
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Patch(':id')
  @Permission('update:permission')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Permission('delete:permission')
  remove(@Param('id') id: string) {
    return this.permissionService.remove(id);
  }
}
