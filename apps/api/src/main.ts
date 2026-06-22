import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Permite que el frontend (otro origen) llame a esta API.
  app.enableCors();

  // Todas las rutas viven bajo /api (ej. /api/health).
  app.setGlobalPrefix('api');

  // Valida automáticamente los datos de entrada según los DTO.
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API de Optiflow escuchando en http://localhost:${port}/api`);
}

bootstrap();
