import 'reflect-metadata';
import { Controller, Get, Module, Provider } from '@nestjs/common';
import { APP_GUARD, NestFactory } from '@nestjs/core';
import { AuthGuard, CurrentUser, RequestScopedAuthGuard } from './auth.guard.js';

@Controller()
class AppController {
  @Get('secret')
  secret() {
    return 'secret data';
  }
}

const setups: Record<string, Provider[]> = {
  'useClass, request-scoped guard': [
    { provide: APP_GUARD, useClass: RequestScopedAuthGuard },
  ],
  'useExisting, request-scoped guard': [
    RequestScopedAuthGuard,
    { provide: APP_GUARD, useExisting: RequestScopedAuthGuard },
  ],
  'useExisting, guard with a request-scoped dependency': [
    CurrentUser,
    AuthGuard,
    { provide: APP_GUARD, useExisting: AuthGuard },
  ],
  'useFactory returning a request-scoped guard': [
    RequestScopedAuthGuard,
    {
      provide: APP_GUARD,
      useFactory: (guard: RequestScopedAuthGuard) => guard,
      inject: [RequestScopedAuthGuard],
    },
  ],
};

for (const [label, providers] of Object.entries(setups)) {
  @Module({ controllers: [AppController], providers })
  class AppModule {}

  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });
  await app.listen(0, '127.0.0.1');
  const res = await fetch(`${await app.getUrl()}/secret`);
  console.log(`${label}: GET /secret without a token -> ${res.status} ${await res.text()}\n`);
  await app.close();
}
