# teletec-admin-api
API NestJS de Teletec Administración de Obras: autenticación, catálogos, reglas de negocio y servicios para el panel web.

Paquete npm `teletec-api` en la versión `0.0.1`. El proyecto es ESM (`"type": "module"`) y hoy expone el chequeo de salud junto con el modelo de usuarios y sesiones sobre PostgreSQL.

## Requisitos

| Herramienta | Versión en este proyecto |
| --- | --- |
| Node.js | `>=24.21.0` (`.nvmrc` fija `24.21.0`) |
| pnpm | `>=12.9.1` (`packageManager` fija `12.9.1`) |
| PostgreSQL | requerido por `pg` y TypeORM |

`package.json` declara `engines` y `packageManager`. `pnpm-workspace.yaml` tiene `engineStrict: true`, así que `pnpm install` se detiene si Node es menor a 24.21.0 y muestra la versión requerida y la actual. Si el pnpm no es 12.9.1, pnpm 12 descarga esa versión y reejecuta el install. Con nvm: `nvm install` y `nvm use` leen `.nvmrc`.

La migración inicial usa `uuid_generate_v4()`, así que la base necesita la extensión `uuid-ossp`.

## Puesta en marcha

```bash
pnpm install
cp .env.example .env
pnpm typeorm migration:run -d src/database/typeorm/data-source.ts
pnpm start:dev
```

La API escucha en el puerto `3001` si `PORT` no está definido. El prefijo global es `api` y el versionado por URI usa `v1` por defecto.

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

| Variable | Requerida | Default | Valores |
| --- | --- | --- | --- |
| `NODE_ENV` | no | `development` | `development`, `qa`, `production` |
| `PORT` | no | `3001` | entero positivo |
| `DATABASE_URL` | sí | — | URL de PostgreSQL |

`.env.example` incluye `NODE_ENV`, `PORT` y `DATABASE_URL`. `DATABASE_URL` no tiene default: hace falta para arrancar la aplicación y para el CLI de TypeORM.

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

## Estructura

```text
src/
  main.ts                         prefijo api, versionado URI v1, puerto
  app.module.ts                   ConfigModule, TypeORM, módulos
  config/env.schema.ts            validación Zod del entorno
  common/entities/base.entity.ts  id UUID, createdAt, updatedAt
  common/http/                    sobre { success, data }, filtro de errores, códigos
  database/typeorm/               conexión Nest y DataSource del CLI
  database/migrations/            migración InitAuth (users, sessions)
  modules/health/                 GET /api/v1/health
  modules/users/                  entidad User
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
| `argon2` | `^0.45.1` | `0.45.1` | Hash de contraseñas |
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
| `@types/supertest` | `^7.0.0` | `7.2.1` | Tipos de Supertest |
| `source-map-support` | `^0.5.21` | `0.5.21` | Mapas de fuente en runtime de desarrollo |

## Datos

`AppBaseEntity` aporta `id` (UUID), `created_at` y `updated_at`.

`users` guarda email único, hash de contraseña, nombre, estado activo y borrado lógico (`deleted_at`, `deleted_by_id`).

`sessions` guarda el hash del refresh token, dispositivo, user agent, IP, última actividad, expiración y revocación. Borrar un usuario está restringido si tiene sesiones (`ON DELETE RESTRICT`).

La migración `InitAuth1791158674739` crea ambas tablas, sus índices y las llaves foráneas.

## Estado actual

Hay un endpoint HTTP: `GET /api/v1/health`. Los módulos de usuarios y sesiones registran las entidades en TypeORM y todavía no publican controladores ni servicios. Catálogos y reglas de negocio del panel quedan por implementar sobre esta base.
