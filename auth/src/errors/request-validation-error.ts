import { ValidationError } from 'express-validator';
import { CustomError } from './custom-error';
export class RequestValidationError extends CustomError {
  statusCode = 400;
  constructor(public errors: ValidationError[]) {
    super('Invalid request parameters');

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }
  // here we are mapping the errors with the RequestValidationError type
  // into our standard error format which is the following:
  // {
  //  errors: {
  //     message: string,
  //     field?: string
  //  }[]
  // }
  // the serializeErrors method is responsible for
  // formatting this specific type of error (RequestValidationError)
  // into our standard error format
  serializeErrors() {
    return this.errors.map(error => ({
      message: error.msg,
      field: error.param,
    }));
  }
}
