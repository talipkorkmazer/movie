import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from '@auth/local-auth.guard';
import { AuthService } from '@auth/auth.service';
import { Public } from '@auth/auth.meta';
import {
  ApiBadRequestResponse,
  ApiBody, ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { LoginSuccessResponseType } from '@auth/types/login-success-response.type';
import { ApiUnauthorizedResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { LoginUnauthorizedResponseType } from '@auth/types/login-unauthorized-response.type';
import { RegisterDto } from '@auth/dto/register.dto';
import { RegisterBadRequestResponseType } from '@auth/types/register-bad-request-response.type';
import { RegisterSuccessResponseType } from '@auth/types/register-success-response.type';
import { RegisterConflictResponseType } from '@auth/types/register-conflict-response.type';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          example: 'admin',
        },
        password: {
          type: 'string',
          example: 'password',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
    type: LoginUnauthorizedResponseType,
  })
  @ApiOkResponse({
    status: 200,
    description: 'Login Successful',
    type: LoginSuccessResponseType,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @ApiOperation({ summary: 'Register' })
  @ApiBadRequestResponse({
    status: 401,
    description: 'Unauthorized',
    type: RegisterBadRequestResponseType,
  })
  @ApiConflictResponse({
    status: 409,
    description: 'Conflict',
    type: RegisterConflictResponseType,
  })
  @ApiOkResponse({
    status: 200,
    description: 'Register Successful',
    type: RegisterSuccessResponseType,
  })
  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
