import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Logger } from 'winston';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        this.logger.info(`${method} ${url} - ${duration}ms`);
      }),
      catchError((error: Error) => {
        const duration = Date.now() - startTime;
        this.logger.error(
          `${method} ${url} - ${duration}ms - Error: ${error.message}`,
          {
            stack: error.stack,
          },
        );
        return throwError(() => error);
      }),
    );
  }
}
