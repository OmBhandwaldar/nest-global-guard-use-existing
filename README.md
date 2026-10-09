# Global guard registered with `useExisting` never runs when it is request-scoped

Minimal reproduction for NestJS: a global guard registered with `{ provide: APP_GUARD, useExisting: Guard }`
(as the testing docs suggest, so the guard can be overridden) or with `useFactory` is never called when
the guard is request-scoped, either explicitly or because one of its dependencies injects `REQUEST`.
The routes it should protect answer normally and nothing is logged. The same guard registered with
`useClass` runs.

Tested with `@nestjs/core` 12.1.2 (also reproduces on 8.4.7, 9.4.3, 10.4.15 and 11.2.7), Node.js 24.16.0, macOS.

```sh
npm install
npm start
```

The script starts the app once per setup and sends `GET /secret` without an `Authorization` header.

| Setup | Actual | Expected |
|---|---|---|
| `useClass`, request-scoped guard | 403 | 403 |
| `useExisting`, request-scoped guard | 200 `secret data`, guard not called | 403 |
| `useExisting`, guard that depends on a request-scoped provider | 200 `secret data`, guard not called | 403, or an error at startup |
| `useFactory` returning a request-scoped guard | 200 `secret data`, guard not called | 403, or an error at startup |

The guards are in `src/auth.guard.ts`, the setups in `src/main.ts`.
