import { NextFunction, Request, Response } from 'express';
import { RequestValidationError } from '../errors/request-validation-error';
import { DatabaseConnectionError } from '../errors/database-connection-error';
import { CustomError } from '../errors/custom-error';

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
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }
  // mapping into our standard error format
  res.status(400).send({ errors: [{ message: 'Something went wrong' }] });
};
