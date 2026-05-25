import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) { }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? (exception.getResponse() as { message: string | string[] }).message
        : 'Internal server error';

    const exceptionResponse = exception instanceof HttpException
      ? exception.getResponse()
      : null;

    const errorCode = exceptionResponse && typeof exceptionResponse === 'object'
      ? (exceptionResponse as { errorCode?: string }).errorCode
      : undefined;

    const errorResponse = {
      errorCode,
      statusCode: status,
      message,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    };

    const messageStr = Array.isArray(message) ? message.join(', ') : message;

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${messageStr}`,
      { stack: exception instanceof Error ? exception.stack : undefined },
    );

    response.status(status).json(errorResponse);
  }
}
