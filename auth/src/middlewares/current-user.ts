import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
  id: string;
  email: string;
}

// this is how to reach into an existing type definition and
// make a modification to it
declare global {
  namespace Express {
    interface Request {
      // add additional property to Request
      currentUser?: UserPayload;
    }
  }
}

// this middleware's job is to check if the user is logged in and
// exctract the payload into this given property
export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // req.session can be null or undefined if the cookieSession middleware
  // has not been set
  if (!req.session?.jwt) {
    return next();
  }
  // if user has tampered the token and if verify finds it invalid it's going to throw an error
  try {
    const payload = jwt.verify(
      req.session.jwt,
      process.env.JWT_KEY!
    ) as UserPayload;

    req.currentUser = payload;
  } catch (err) {}

  next();
};
