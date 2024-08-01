import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import jwtConfig from 'src/iam/config/jwt.config';
import { REQUEST_USER_KEY } from 'src/iam/iam.constants';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.jwtConfiguration.secret,
      });

      request[REQUEST_USER_KEY] = payload; // Assign the payload to the request object
      console.log('Payload:', payload); // Debugging statement to log the payload
      console.log('Request Key:', request[REQUEST_USER_KEY]); // Debugging statement to log the payload
    } catch (err) {
      console.error('Token validation error:', err); // Debugging statement to log the error
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [authType, token] = request.headers.authorization?.split(' ') ?? [];
    return authType === 'Bearer' ? token : undefined;
  }
}

// import {
//   CanActivate,
//   ExecutionContext,
//   Inject,
//   Injectable,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { ConfigType } from '@nestjs/config';
// import { JwtService } from '@nestjs/jwt';
// import { Request } from 'express';
// import jwtConfig from 'src/iam/config/jwt.config';
// import { REQUEST_USER_KEY } from 'src/iam/iam.constants';

// @Injectable()
// export class AccessTokenGuard implements CanActivate {
//   constructor(
//     private readonly jwtService: JwtService,
//     @Inject(jwtConfig.KEY)
//     private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const token = this.extractTokenFromHeader(request);

//     if (!token) {
//       throw new UnauthorizedException();
//     }

//     try {
//       const payload = await this.jwtService.verifyAsync(
//         token,
//         this.jwtConfiguration,
//       );

//       request[REQUEST_USER_KEY];
//       console.log(payload);
//     } catch {
//       throw new UnauthorizedException();
//     }

//     return true;
//   }

//   private extractTokenFromHeader(request: Request): string | undefined {
//     const [_auth, token] = request.headers.authorization?.split(' ') ?? [];

//     return token;
//   }
// }
