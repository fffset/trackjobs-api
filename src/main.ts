import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import cookieParser from 'cookie-parser';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.use(cookieParser());

  app.enableCors({
    origin: [
      'http://localhost:3000',
      process.env.FRONTEND_URL || 'https://trackjobs-web.vercel.app',
    ],
    credentials: true,
  });

  app.useGlobalInterceptors(app.get(LoggingInterceptor));
  app.useGlobalFilters(app.get(GlobalExceptionFilter));

  await app.listen(process.env.PORT ?? 8000);
}
void bootstrap();
