# teletec-admin-api
API NestJS de Teletec Administración de Obras: autenticación, catálogos, reglas de negocio y servicios para el panel web.

Paquete npm `teletec-api` en la versión `0.0.1`. El proyecto es ESM (`"type": "module"`) y expone autenticación, usuarios, áreas, invitaciones y auditoría sobre PostgreSQL.

## Requisitos

| Herramienta | Versión en este proyecto |
| --- | --- |
| Node.js | `>=24.21.0` (`.nvmrc` fija `24.21.0`) |
| pnpm | `>=12.9.1` (`packageManager` fija `12.9.1`) |
| PostgreSQL | requerido por `pg` y TypeORM |

`package.json` declara `engines` y `packageManager`. `pnpm-workspace.yaml` tiene `engineStrict: true`, así que `pnpm install` se detiene si Node es menor a 24.21.0 y muestra la versión requerida y la actual. Si el pnpm no es 12.9.1, pnpm 12 descarga esa versión y reejecuta el install. Con nvm: `nvm install` y `nvm use` leen `.nvmrc`.

La migración inicial ejecuta `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"` y las tablas usan `uuid_generate_v4()`. No hace falta crear la extensión a mano si el rol de `DATABASE_URL` puede hacerlo.

## Puesta en marcha

```bash
pnpm install
cp .env.example .env
pnpm typeorm migration:run -d src/database/typeorm/data-source.ts
pnpm start:dev
```

La API escucha en el puerto `3001` si `PORT` no está definido. Al arrancar, el log indica el puerto. El prefijo global es `api` y el versionado por URI usa `v1` por defecto. Swagger queda en `http://localhost:3001/api/docs`. CORS permite el origen de `FRONTEND_URL` con credenciales.

Comprobación:

```bash
curl http://localhost:3001/api/v1/health
```

Respuesta esperada:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "<ISO-8601>"
  }
}
```

`ResponseInterceptor` envuelve todo cuerpo exitoso en `{ success, data }`.

## Variables de entorno

`ConfigModule` valida el entorno con Zod en `src/config/env.schema.ts`.

| Variable | Requerida para arrancar | Default | Valores |
| --- | --- | --- | --- |
| `NODE_ENV` | no | `development` | `development`, `qa`, `production` |
| `PORT` | no | `3001` | entero positivo |
| `DATABASE_URL` | sí | — | URL de PostgreSQL |
| `RESEND_API_KEY` | sí | — | API key de la cuenta de Resend |
| `EMAIL_FROM` | sí | — | Remitente. El dominio tiene que estar verificado en esa misma cuenta. Ejemplo: `TELETEC <invitaciones@dominio.com>` |
| `FRONTEND_URL` | sí | — | URL del front, sin barra final. También es el origen de CORS y la base del enlace de invitación |
| `JWT_ACCESS_SECRET` | sí | — | Secreto del access token, mínimo 32 caracteres |
| `JWT_ACCESS_EXPIRES_IN` | sí | — | Duración del access token: `30s`, `15m`, `1h` o `1d` |
| `SESSION_EXPIRES_DAYS` | sí | — | Entero de 1 a 90. Vida de la sesión y de la cookie `refresh_token` |
| `SEED_ADMIN_EMAIL` | no | `admin@teletec.local` | Solo la usa `pnpm seed:admin` |
| `SEED_ADMIN_PASSWORD` | no | — | Solo la usa `pnpm seed:admin`. Sin ella el comando se detiene |

`.env.example` deja las claves vacías. Una clave requerida vacía impide arrancar. `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` no entran en la validación de Zod: la API arranca sin ellas.

## Scripts

| Script | Comando | Uso |
| --- | --- | --- |
| `pnpm start` | `nest start` | Arranque único |
| `pnpm start:dev` | `nest start --watch` | Desarrollo con recarga |
| `pnpm start:debug` | `nest start --debug --watch` | Desarrollo con inspector |
| `pnpm start:prod` | `node dist/main` | Proceso compilado |
| `pnpm build` | `nest build` | Compila a `dist/` |
| `pnpm deploy` | `nest deploy` | Despliegue del CLI de Nest |
| `pnpm lint` | `oxlint --type-aware src/` | Lint con Oxlint |
| `pnpm format` | `prettier --write "src/**/*.ts"` | Formato con Prettier |
| `pnpm test` | `vitest run` | Tests unitarios (`*.spec.ts`) |
| `pnpm test:watch` | `vitest` | Tests en modo watch |
| `pnpm test:cov` | `vitest run --coverage` | Cobertura con V8 |
| `pnpm test:debug` | `vitest --inspect-brk --no-file-parallelism` | Tests con inspector |
| `pnpm test:e2e` | `vitest run --config ./vitest.config.e2e.ts` | E2E (`*.e2e-spec.ts`) |
| `pnpm typeorm` | `typeorm-ts-node-esm` | CLI de TypeORM |
| `pnpm seed:admin` | `node --loader ts-node/esm --no-warnings src/database/seeds/admin.seed.ts` | Crea el usuario administrador si el correo no existe |

Migraciones, siempre con el data source del repo:

```bash
pnpm typeorm migration:show -d src/database/typeorm/data-source.ts
pnpm typeorm migration:run -d src/database/typeorm/data-source.ts
pnpm typeorm migration:revert -d src/database/typeorm/data-source.ts
pnpm typeorm migration:generate src/database/migrations/Nombre -d src/database/typeorm/data-source.ts
pnpm typeorm migration:create src/database/migrations/Nombre
```

`migration:generate` compara las entidades con la base y escribe el SQL del cambio. Necesita `DATABASE_URL` y que las migraciones anteriores ya estén aplicadas. `migration:create` deja un archivo vacío en `src/database/migrations/` para escribir el SQL a mano.

`synchronize` está desactivado. El esquema cambia solo por migraciones en `src/database/migrations/`. La tabla de control se llama `migrations`.

El seeder no corre al arrancar ni dentro de una migración. Con `SEED_ADMIN_PASSWORD` en `.env`:

```bash
pnpm seed:admin
```

Inserta un usuario activo, ya activado, con nombre Administrador TELETEC. El correo sale de `SEED_ADMIN_EMAIL` o, si no está, de `admin@teletec.local`. Si ese correo ya existe, no lo vuelve a crear y no borra otros usuarios.

## Estructura

```text
src/
  main.ts                         prefijo api, versionado URI v1, puerto
  app.module.ts                   ConfigModule, TypeORM, módulos
  config/env.schema.ts            validación Zod del entorno
  common/entities/base.entity.ts  id UUID, createdAt, updatedAt
  common/http/                    sobre { success, data }, filtro de errores, códigos, mensajes
  database/typeorm/               conexión Nest y DataSource del CLI
  database/migrations/            esquema: users, sessions, areas, audit, invitations
  database/seeds/                 usuario administrador de `pnpm seed:admin`
  modules/health/                 GET /api/v1/health
  modules/auth/                   login, refresh y logout
  modules/users/                  listado, detalle, edición, borrado lógico y restauración
  modules/areas/                  catálogo de áreas
  modules/invitations/            alta de usuarios por invitación
  modules/email/                  envío con Resend
  modules/audit/                  historial de cambios
  modules/sessions/               entidad Session
```

## Dependencias

Versiones instaladas según `pnpm-lock.yaml`.

### Runtime

| Paquete | Declarado | Instalado | Rol |
| --- | --- | --- | --- |
| `@nestjs/common` | `^12.0.1` | `12.1.2` | Framework |
| `@nestjs/core` | `^12.0.1` | `12.1.2` | Núcleo de Nest |
| `@nestjs/platform-express` | `^12.0.1` | `12.1.2` | HTTP con Express |
| `@nestjs/config` | `^12.0.1` | `12.0.1` | Configuración y validación |
| `@nestjs/typeorm` | `^12.0.2` | `12.0.2` | Integración TypeORM |
| `typeorm` | `^1.1.1` | `1.1.1` | ORM y migraciones |
| `pg` | `^8.23.1` | `8.23.1` | Driver de PostgreSQL |
| `zod` | `^4.6.5` | `4.6.5` | Esquema de entorno |
| `@nestjs/jwt` | `^12.0.2` | `12.0.2` | Access token |
| `@nestjs/swagger` | `^12.0.2` | `12.0.2` | OpenAPI en `/api/docs` |
| `swagger-ui-express` | `^5.0.1` | `5.0.1` | UI de Swagger |
| `argon2` | `^0.45.1` | `0.45.1` | Hash de contraseñas |
| `cookie-parser` | `^1.4.7` | `1.4.7` | Cookie `refresh_token` |
| `resend` | `^6.32.0` | `6.32.0` | Envío de correos |
| `@react-email/render` | `^2.1.0` | `2.1.0` | HTML del correo de invitación |
| `react` | `^19.3.0` | `19.3.0` | Plantilla del correo |
| `react-email` | `^6.11.0` | `6.11.0` | Plantilla del correo |
| `class-validator` | `^0.15.1` | `0.15.1` | Validación de DTOs |
| `class-transformer` | `^0.5.1` | `0.5.1` | Transformación de DTOs |
| `dotenv` | `^18.0.5` | `18.0.5` | Carga `.env` en el DataSource |
| `rxjs` | `^7.8.1` | `7.8.2` | Dependencia de Nest |
| `reflect-metadata` | `^0.2.2` | `0.2.2` | Metadatos de decoradores |

### Desarrollo

| Paquete | Declarado | Instalado | Rol |
| --- | --- | --- | --- |
| `typescript` | `^6.0.2` | `6.0.3` | Compilación (`ES2023`, `nodenext`) |
| `@nestjs/cli` | `^12.0.0` | `12.0.8` | CLI de Nest |
| `@nestjs/schematics` | `^12.0.0` | `12.0.6` | Generadores |
| `@nestjs/testing` | `^12.0.1` | `12.1.2` | Utilidades de test |
| `@nestjs/mau` | `^0.2.6` | `0.2.8` | Herramienta del CLI de Nest |
| `vitest` | `^4.1.2` | `4.1.11` | Tests |
| `@vitest/coverage-v8` | `^4.1.2` | `4.1.11` | Cobertura |
| `supertest` | `^7.0.0` | `7.3.1` | Peticiones HTTP en e2e |
| `oxlint` | `^1.58.0` | `1.86.0` | Linter |
| `oxlint-tsgolint` | `^7.0.2001` | `7.0.2003` | Reglas TypeScript de Oxlint |
| `prettier` | `^3.4.2` | `3.9.9` | Formato (`singleQuote`, `trailingComma: all`) |
| `ts-node` | `^10.9.2` | `10.9.2` | Ejecuta el CLI de TypeORM |
| `vite-tsconfig-paths` | `^5.1.4` | `5.1.4` | Alias de `tsconfig` en Vitest |
| `@types/node` | `^24.0.0` | `24.19.1` | Tipos de Node |
| `@types/express` | `^5.0.0` | `5.0.6` | Tipos de Express |
| `@types/cookie-parser` | `^1.4.10` | `1.4.10` | Tipos de cookie-parser |
| `@types/react` | `^19.3.0` | `19.3.0` | Tipos de la plantilla de correo |
| `@types/supertest` | `^7.0.0` | `7.2.1` | Tipos de Supertest |
| `source-map-support` | `^0.5.21` | `0.5.21` | Mapas de fuente en runtime de desarrollo |

## Datos

`AppBaseEntity` aporta `id` (UUID), `created_at` y `updated_at`.

`users` guarda email único, hash de contraseña, nombre, teléfono, estado activo, `activated_at` y borrado lógico (`deleted_at`, `deleted_by_id`). El correo sigue siendo único aunque el usuario esté borrado.

`sessions` guarda el hash del refresh token, dispositivo, user agent, IP, última actividad, expiración y revocación. Borrar un usuario está restringido si tiene sesiones (`ON DELETE RESTRICT`).

`areas` guarda el nombre único y si está activa. `user_areas` relaciona usuario y área.

`invitations` guarda el hash del token, vencimiento, uso y revocación. `audit_logs` guarda la acción, el actor y el antes y el después de cada cambio de estado.

Las migraciones aplicadas son `InitAuth`, `CreateAuditLogs`, `CreateAreas`, `UpdateUsersAndUserAreas` y `CreateInvitations`.

## HTTP

Un éxito llega como `{ success, data }`. Un listado agrega `meta`. Un error llega como `{ success: false, error: { statusCode, code, message, details? } }`.

El `code` no cambia de idioma. El `message` de un error de negocio sale en español. En una validación de DTO, `message` sigue siendo `Validation failed` y el texto en español va en `details.messages` y `details.fields`.

El login devuelve el access token en el cuerpo y guarda `refresh_token` en una cookie `httpOnly`, `SameSite=Lax`, con path `/api/v1/auth`. `secure` solo se activa si `NODE_ENV` es `production`. Refresh y logout usan esa cookie.

## Endpoints

| Método | Ruta |
| --- | --- |
| `GET` | `/api/v1/health` |
| `POST` | `/api/v1/auth/login` |
| `POST` | `/api/v1/auth/refresh` |
| `POST` | `/api/v1/auth/logout` |
| `GET` | `/api/v1/areas` |
| `GET` | `/api/v1/areas/:id` |
| `POST` | `/api/v1/areas` |
| `PATCH` | `/api/v1/areas/:id` |
| `GET` | `/api/v1/users` |
| `GET` | `/api/v1/users/:id` |
| `PATCH` | `/api/v1/users/:id` |
| `DELETE` | `/api/v1/users/:id` |
| `POST` | `/api/v1/users/:id/restore` |
| `GET` | `/api/v1/invitations` |
| `GET` | `/api/v1/invitations/:id` |
| `POST` | `/api/v1/invitations` |
| `POST` | `/api/v1/invitations/accept` |
| `POST` | `/api/v1/invitations/:id/resend` |
| `POST` | `/api/v1/invitations/:id/revoke` |

No hay alta pública de usuarios. `POST /api/v1/invitations` crea al usuario pendiente y envía el correo. Aceptar la invitación activa la cuenta y guarda la contraseña. `DELETE /api/v1/users/:id` es un borrado lógico.

`GET /api/v1/users` filtra por `isActive`, `search` y `areaId`. Si omites `isActive`, devuelve activos e inactivos, y nunca los borrados. `GET /api/v1/areas` filtra por `isActive` y `search`. `GET /api/v1/invitations` filtra por `status`, `search` y `userId`. `status` acepta varios valores, repetidos o separados por coma (`pending`, `accepted`, `revoked`, `expired`). Si se omite, devuelve todos. Los tres listados paginan con `page` y `limit`.
