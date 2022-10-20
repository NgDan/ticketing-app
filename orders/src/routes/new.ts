import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from '@ng-ticketing-app/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';

const router = express.Router();
const EXPIRATION_WINDOW_SECONDS = 15 * 60;

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
    const { ticketId } = req.body;

    // find the ticket the user is trying to order in the database (if we fail to fetch the ticket from the db it means it's already been sold, deleted, etc)
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    // make sure this ticket is not already reserved
    const isReserved = await ticket.isReserved();

    if (isReserved) {
      throw new BadRequestError('Ticket is already reserved');
    }

    // calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // build the order and save it to the database
    const order = Order.build({
      // we're certain the currentUser property is defined since we've got the requireAuth middleware
      // that would've bailed out if the currentUser wasn't there
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    });

    await order.save();

    // publish an event to notify an order has been created

    res.send(201).send(order);
  }
);

export { router as newOrderRouter };
