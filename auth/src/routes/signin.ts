import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, BadRequestError } from '@ng-ticketing-app/common';
import { User } from '../models/user';
import { Password } from '../services/password';
import jwt from 'jsonwebtoken';

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
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password: suppliedPassword } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const passwordsMatch = await Password.compare(
      existingUser.password,
      suppliedPassword
    );

    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY! // we already typeguard this in index.ts so we can be confident this will be defined and we can use the non-null assertion operator "!"
    );

    // Store it on session object (cookie-parser will detect the session object and automatically serialize it and convert it to cookies and attach them to the request)
    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(existingUser);
  }
);

// we're renaming it as we export it
export { router as signinRouter };
