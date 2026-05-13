import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });
  app.use(cookieParser());

  app.enableCors({
    origin: [
      'http://localhost:3000',
      process.env.FRONTEND_URL || 'https://trackjobs-web.vercel.app',
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
  Logger.log(`Application running on port ${process.env.PORT ?? 3000}`);
}
void bootstrap();
