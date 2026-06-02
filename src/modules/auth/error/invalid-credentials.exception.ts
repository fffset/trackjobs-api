import { HttpStatus } from '@nestjs/common';
import { BaseException } from 'src/common/exceptions/base.exception';
import { ErrorCode } from 'src/common/exceptions/error-codes.enum';


export class InvalidCredentialsException extends BaseException {
  constructor() {
    super(
      ErrorCode.AUTH_INVALID_CREDENTIALS,
      'Invalid email or password',
      HttpStatus.UNAUTHORIZED,
    );
  }
}