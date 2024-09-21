import {
  Body,
  Controller, Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from '@auth/guards/local-auth.guard';
import { AuthService } from '@auth/services/auth.service';
import { Public } from '@auth/metas/auth.meta';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
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
import { LoginDto } from '@auth/dto/login.dto';
import { UserModel } from '@auth/models/auth.model';

@ApiTags('Auth')
@ApiBadRequestResponse({
  status: 401,
  description: 'Unauthorized',
  type: RegisterBadRequestResponseType,
})
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    status: HttpStatus.OK,
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
  @ApiConflictResponse({
    status: 409,
    description: 'Conflict',
    type: RegisterConflictResponseType,
  })
  @ApiOkResponse({
    status: HttpStatus.CREATED,
    description: 'Register Successful',
    type: RegisterSuccessResponseType,
  })
  @HttpCode(HttpStatus.CREATED)
  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'Profile' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Profile',
    type: UserModel,
  })
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
