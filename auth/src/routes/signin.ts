import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { RequestValidationError } from '../errors/request-validation-error';

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      // no need to restrict the password to the same rules as in signup since we can change the rules over time
      // so that would prevent old users with passwords following the old rules from signing in
      .notEmpty()
      .withMessage('You must supply a password'),
  ],
  (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new RequestValidationError(errors.array());
    }
  }
);

// we're renaming it as we export it
export { router as signinRouter };
