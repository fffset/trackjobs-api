import { HttpStatus } from "@nestjs/common";
import { BaseException } from "src/common/exceptions/base.exception";
import { ErrorCode } from "src/common/exceptions/error-codes.enum";

export class ApplicationNotFoundException extends BaseException {
  constructor(id: string) {
    super(
      ErrorCode.APP_NOT_FOUND,
      `Application with id ${id} not found`,
      HttpStatus.NOT_FOUND,
    );
  }
}