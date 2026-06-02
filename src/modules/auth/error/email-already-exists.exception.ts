import { HttpStatus } from "@nestjs/common";
import { BaseException } from "src/common/exceptions/base.exception";
import { ErrorCode } from "src/common/exceptions/error-codes.enum";

export class EmailAlreadyExistsException extends BaseException {
  constructor() {
    super(
      ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
      'Email address is already in use',
      HttpStatus.CONFLICT,
    );
  }
}