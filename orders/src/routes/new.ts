import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { requireAuth, validateRequest } from '@ng-ticketing-app/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';

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
    // find the ticket the user is trying to order in the database (if we fail to fetch the ticket from the db it means it's already been sold, deleted, etc)

    // make sure this ticket is not already reserved

    // calculate an expiration date for this order

    // build the order and save it to the database

    // publish an event to notify an order has been created

    res.send({});
  }
);

export { router as newOrderRouter };
