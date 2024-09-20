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
import { Permission } from '@/permission/permissions.decorator';
import { RoleService } from '@role/role.service';
import { CreateRoleDto } from '@role/dto/create-role.dto';
import { UpdateRoleDto } from '@role/dto/update-role.dto';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('')
  @Permission('view:roles')
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  @Permission('view:role')
  find(@Param('id') id: string) {
    return this.roleService.find(id);
  }

  @Post()
  @Permission('create:role')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Patch(':id')
  @Permission('update:role')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Permission('delete:role')
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}
