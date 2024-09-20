import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@/auth/auth.meta';
import { UserModel } from '@/auth/auth.model';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const user = this.extractAuthorization(request);
    // Make sure authorization is present
    if (!user) {
      console.error('Authorization is missing or invalid.');
      throw new UnauthorizedException('Authorization is missing or invalid.');
    }
    const expirationDate = new Date(0);
    expirationDate.setUTCSeconds(user.exp);
    if (expirationDate < new Date()) {
      console.error(`Token is expired {exp: ${user.exp}}.`);
      throw new UnauthorizedException('Token is expired, please login again.');
    }

    // Update request with user
    request['user'] = user;

    return super.canActivate(context);
  }

  /**
   * Extract authorization from request
   *
   * @param request
   * @private
   */
  private extractAuthorization(request: Request): UserModel | null {
    // Make sure authorization header is present
    if (!request.headers.authorization) {
      console.error('Authorization header is missing in request.');
      return null;
    }

    // Extract type and token from header
    const [type, token] = request.headers.authorization.split(' ') ?? [];
    // Accept only bearer token type
    if ('bearer' !== type.toLowerCase()) {
      console.error('Authorization type is invalid in request.');
      return null;
    }

    // Extract token payload
    let user: UserModel;
    try {
      const base64Payload = token.split('.')[1];
      const payloadBuffer = Buffer.from(base64Payload, 'base64');
      user = JSON.parse(payloadBuffer.toString()) as UserModel;
      if (!user) {
        throw new Error('Parse failed');
      }
    } catch (e) {
      console.error(
        `Authorization payload parse failed in request. {token: ${token}, error: ${e}}`,
      );
      return null;
    }

    // Make sure user email and name is present in payload
    if (!user.username) {
      console.error('Authorization user is invalid in request.');
      return null;
    }

    return user;
  }
}
