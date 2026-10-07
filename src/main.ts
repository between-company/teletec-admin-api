import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser'
import { AppModule } from './app.module.js';
import { DEFAULT_API_VERSION } from './common/constants/api-version.constants.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService)
  const port = configService.getOrThrow<number>('PORT')
  const frontendUrl = configService
    .getOrThrow<string>('FRONTEND_URL')
    .replace(/\/$/, '')

  app.enableCors({
    origin: frontendUrl,
    credentials: true
  })
  
  const swaggerConfig = new DocumentBuilder()
    .setTitle('TELETEC Admin API')
    .setDescription('API para la plataforma de Administración de Obras de TELETEC')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
    
  app.enableShutdownHooks()
  
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: DEFAULT_API_VERSION,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  )
  app.use(cookieParser())

  const swaggerDocument = SwaggerModule.createDocument(
    app,
    swaggerConfig
  )

  SwaggerModule.setup(
    'docs',
    app,
    swaggerDocument,
    {
      useGlobalPrefix: true
    }
  )
  await app.listen(port);
}
await bootstrap();
