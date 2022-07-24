import { NextFunction, Request, Response } from 'express';
import { RequestValidationError } from '../errors/request-validation-error';
import { DatabaseConnectionError } from '../errors/database-connection-error';

// we'll use this handler throughout all our microservies
// so it catches all the errors and normalizez them with
// using the same structure. This solves the problem of
// having multiple error formats in different microservices
// that each other have to be aware of.
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof RequestValidationError) {
    console.log('handling this error as a request validation error');

    // here we are mapping the errors with the RequestValidationError type
    // into our standard error format which is the following:
    // {
    //  errors: {
    //     message: string,
    //     field?: string
    //  }[]
    // }

    const formattedErrors = err.errors.map(error => ({
      message: error.msg,
      field: error.param,
    }));

    return res.status(400).send({ errors: formattedErrors });
  }
  if (err instanceof DatabaseConnectionError) {
    // mapping into our standard error format
    return res.status(500).send({ errors: [{ message: err.reason }] });
  }
  const { message } = err;
  // mapping into our standard error format
  res.status(400).send({ errors: [{ message: 'Something went wrong' }] });
};
