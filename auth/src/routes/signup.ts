import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/user';
import { RequestValidationError } from '../errors/request-validation-error';
import { BadRequestError } from '../errors/bad-request-error';

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
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new RequestValidationError(errors.array());
    }

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError('Email already in use');
    }

    // create and save a user
    const user = User.build({ email, password });
    await user.save();

    res.status(201).send(user);
  }
);

// we're renaming it as we export it
export { router as signupRouter };
