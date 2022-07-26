import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { User } from '../models/user';
import { BadRequestError, validateRequest } from '@ng-ticketing-app/common';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post(
  '/api/users/signup',
  // this body validator is added as a middleware
  // if there's an error, the validator will
  // return a response early with the error
  // message data. The problem is, the error
  // message data format (type) is decided by
  // express-validator. In a microservices
  // architecture, each service might have
  // a different library for validating data
  // so we can end up with a lot of different
  // types for errors. The frontend would have to
  // know about all those types and acocunt for
  // them (tight coupling)
  // we need to standardize our error types/structures
  // across all our microservices
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters'),
  ],
  // note that this middleware that handles the error
  // has to be placed after the validation that throws
  // that error
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError('Email already in use');
    }

    // create and save a user
    const user = User.build({ email, password });
    await user.save();

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      // the token will be signed using this key
      // the only way to verify if this is a valid
      // token is with this key, so all the other services
      // will have to have access to this key
      // We also don't need a .env file for this since it's set inside the container by the configuration file
      process.env.JWT_KEY! // we already typeguard this in index.ts so we can be confident this will be defined and we can use the non-null assertion operator "!"
    );

    // Store it on session object (cookie-parser will detect the session object and automatically serialize it and convert it to cookies and attach them to the request)
    req.session = {
      jwt: userJwt,
    };

    res.status(201).send(user);
  }
);

// we're renaming it as we export it
export { router as signupRouter };
