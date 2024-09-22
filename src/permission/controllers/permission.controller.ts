import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Permission } from '@permission/decorators/permissions.decorator';
import { PermissionService } from '@permission/services/permission.service';
import { UpdatePermissionDto } from '@permission/dto/update-permission.dto';
import { CreatePermissionDto } from '@permission/dto/create-permission.dto';
import {
  ApiBody, ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiUnauthorizedResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { LoginUnauthorizedResponseType } from '@auth/types/login-unauthorized-response.type';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { PermissionOutputDto } from '@permission/dto/permission-output.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResult } from '@/common/types/paginated-result';
import { PermissionNotfoundResponseType } from '@permission/types/permission-notfound-response.type';
import { MovieConflictResponseType } from '@movie/types/movie-conflict-response.type';
import { PermissionConflictResponseType } from '@permission/types/permission-conflict-response.type';

@ApiTags('Permissions')
@ApiUnauthorizedResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Unauthorized',
  type: LoginUnauthorizedResponseType,
})
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @ApiOperation({ summary: 'Get all permissions' })
  @ApiPaginatedResponse(PermissionOutputDto)
  @Get('')
  @Permission('view:permissions')
  findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<PermissionOutputDto>> {
    return this.permissionService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get a permission by id' })
  @ApiOkResponse({ type: PermissionOutputDto })
  @ApiNotFoundResponse({
    description: 'Permission not found',
    type: PermissionNotfoundResponseType,
    status: HttpStatus.NOT_FOUND,
  })
  @Get(':id')
  @Permission('view:permission')
  find(@Param('id') id: string): Promise<PermissionOutputDto> {
    return this.permissionService.find(id);
  }

  @ApiOperation({ summary: 'Create a permission' })
  @ApiOkResponse({ type: PermissionOutputDto })
  @ApiConflictResponse({
    description: 'Permission already exists',
    type: PermissionConflictResponseType,
    status: HttpStatus.CONFLICT,
  })
  @ApiBody({ type: CreatePermissionDto })
  @Post()
  @Permission('create:permission')
  create(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<PermissionOutputDto> {
    return this.permissionService.create(createPermissionDto);
  }

  @ApiOperation({ summary: 'Update a permission' })
  @ApiOkResponse({ type: PermissionOutputDto })
  @ApiNotFoundResponse({
    description: 'Permission not found',
    type: PermissionNotfoundResponseType,
    status: HttpStatus.NOT_FOUND,
  })
  @ApiConflictResponse({
    description: 'Permission already exists',
    type: PermissionConflictResponseType,
    status: HttpStatus.CONFLICT,
  })
  @Patch(':id')
  @Permission('update:permission')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionOutputDto> {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @ApiOperation({ summary: 'Delete a permission' })
  @ApiNotFoundResponse({
    description: 'Permission not found',
    type: PermissionNotfoundResponseType,
    status: HttpStatus.NOT_FOUND,
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permission('delete:permission')
  remove(@Param('id') id: string): Promise<void> {
    return this.permissionService.remove(id);
  }
}
