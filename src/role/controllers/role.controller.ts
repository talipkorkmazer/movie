import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode, HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Permission } from '@permission/decorators/permissions.decorator';
import { RoleService } from '@role/services/role.service';
import { CreateRoleDto } from '@role/dto/create-role.dto';
import { UpdateRoleDto } from '@role/dto/update-role.dto';
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiUnauthorizedResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { LoginUnauthorizedResponseType } from '@auth/types/login-unauthorized-response.type';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { RolesOutputDto } from '@role/dto/roles-output.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResult } from '@/common/types/paginated-result';
import { RoleOutputDto } from '@role/dto/role-output.dto';
import { RoleNotfoundResponseType } from '@role/types/role-notfound-response.type';

@ApiTags('Roles')
@ApiUnauthorizedResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Unauthorized',
  type: LoginUnauthorizedResponseType,
})
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({ summary: 'Get all roles' })
  @ApiPaginatedResponse(RolesOutputDto)
  @Get()
  @Permission('view:roles')
  findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<RolesOutputDto>> {
    return this.roleService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get a role by id' })
  @ApiOkResponse({ type: RolesOutputDto })
  @Get(':id')
  @Permission('view:role')
  find(@Param('id') id: string): Promise<RolesOutputDto> {
    return this.roleService.find(id);
  }

  @ApiOperation({ summary: 'Create a role' })
  @ApiOkResponse({ type: RoleOutputDto })
  @ApiBody({ type: CreateRoleDto })
  @Post()
  @Permission('create:role')
  create(@Body() createRoleDto: CreateRoleDto): Promise<RoleOutputDto> {
    return this.roleService.create(createRoleDto);
  }

  @ApiOperation({ summary: 'Update a role' })
  @ApiOkResponse({ type: RoleOutputDto })
  @Patch(':id')
  @Permission('update:role')
  update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleOutputDto> {
    return this.roleService.update(id, updateRoleDto);
  }

  @ApiOperation({ summary: 'Delete a role' })
  @ApiNotFoundResponse({
    description: 'Role not found',
    type: RoleNotfoundResponseType,
    status: HttpStatus.NOT_FOUND,
  })
  @Delete(':id')
  @HttpCode(204)
  @Permission('delete:role')
  remove(@Param('id') id: string): Promise<void> {
    return this.roleService.remove(id);
  }
}
