import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { requireAuth, validateRequest } from '@ng-ticketing-app/common';
import { body } from 'express-validator';

const router = express.Router();

router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      // this makes sure the user passes in a valid mongoid.
      // This kind of check is dangerous since we're coupling
      // the tickets service to the orders service since the
      // orders service is now aware of what type the userId
      // should have. If we change the db in the tickets service
      // this orders service will be affected as well.
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('Ticket must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    res.send({});
  }
);

export { router as newOrderRouter };
