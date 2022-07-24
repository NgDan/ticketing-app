import { NextFunction, Request, Response } from 'express';

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
  console.log('Something went wrong', err);
  const { message } = err;
  res.status(400).send({ message });
};
