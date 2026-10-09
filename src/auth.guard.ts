import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

// Request-scoped because it reads the current request.
@Injectable({ scope: Scope.REQUEST })
export class CurrentUser {
  constructor(@Inject(REQUEST) private readonly request: any) {}

  get token(): string | undefined {
    return this.request.headers.authorization;
  }
}

// Default scope, but request-scoped through CurrentUser.
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(CurrentUser) private readonly user: CurrentUser) {}

  canActivate(_context: ExecutionContext) {
    console.log('AuthGuard.canActivate() called');
    return this.user.token === 'Bearer secret';
  }
}

@Injectable({ scope: Scope.REQUEST })
export class RequestScopedAuthGuard implements CanActivate {
  constructor(@Inject(REQUEST) private readonly request: any) {}

  canActivate(_context: ExecutionContext) {
    console.log('RequestScopedAuthGuard.canActivate() called');
    return this.request.headers.authorization === 'Bearer secret';
  }
}
