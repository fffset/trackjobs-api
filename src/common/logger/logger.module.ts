import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston/dist/winston.module';
import * as winston from 'winston';

import { TransformableInfo } from 'logform';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf((info: TransformableInfo) => {
              const { timestamp, level, message, context, trace } =
                info as TransformableInfo & {
                  timestamp: string;
                  context?: string;
                  trace?: string;
                };
              return `${timestamp} [${level}] ${context ? `[${context}]` : ''} ${message as string}${trace ? `\n${trace}` : ''}`;
            }),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
