import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT || 3000;

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(PORT);

  logger.log(`>>> >>> Server is running on port ${PORT}`);
}

bootstrap();
