import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // ENV VARIABLES
  const PORT = configService.getOrThrow('PORT');
  const APP_URL = configService.getOrThrow('APP_URL');

  // APP
  app.setGlobalPrefix('api');
  app.use(cookieParser());

  app.enableCors({
    origin: [
      'http://localhost:3001',
      'https://r6nt2plp-3001.asse.devtunnels.ms',
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
      'x-api-key',
    ],
    exposedHeaders: ['X-API-Key', 'x-api-key'],
    credentials: true,
  });

  // VALIDATION
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // SWAGGER CONFIGURATION
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Roy`s Students application Api')
    .setDescription(
      'API documentation for Roy`s Students backend application. Provides detailed information about the available routes, request parameters, and responses.',
    )
    .setVersion('1.1')
    .addBearerAuth({
      description: `Please enter token in following format: Bearer <JWT>`,
      name: 'Authorization',
      bearerFormat: 'Bearer',
      scheme: 'Bearer',
      type: 'http',
      in: 'Header',
    })
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'Ключ супер-администратора',
      },
      'x-api-key', // Идентификатор схемы безопасности
    )
    .setContact(
      'Roy`s Students Support',
      'https://zenspace.ru/',
      'zenspace.nn@gmail.com',
    )
    .setLicense('Get developer contacts', 'https://t.me/purpletooth')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  // LOGGER
  const logger = new Logger('Bootstrap');

  // SERVER LISTEN
  await app.listen(PORT);

  logger.log(`----------------------------------------------------------`);
  logger.log(`🚀 Server started successfully on port ${PORT}`);
  logger.log(`🔗 Swagger UI is available at ${APP_URL}:${PORT}/api/docs`);
  logger.log(`🗂️ Application base URL is ${APP_URL}:${PORT}`);
  logger.log(`🔧 Environment: ${process.env.NODE_ENV}`);
  logger.log(`----------------------------------------------------------`);
}

bootstrap();
