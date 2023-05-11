import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Order } from '../models/order';
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
  OrderStatus,
} from '@ng-ticketing-app/common';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/payments',
  requireAuth,
  [body('token').not().isEmpty(), body('orderId').not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) throw new NotFoundError();

    // if the user that intends to pay is the same one that created the order
    if (order.userId !== req.currentUser!.id) throw new NotAuthorizedError();

    if (order.status === OrderStatus.Cancelled)
      throw new BadRequestError('Cannot pay for an cancelled order');

    const charge = await stripe.charges.create({
      currency: 'usd',
      // stripe work on the "smallest currency unit" which is cents in the case of usd
      amount: order.price * 100,
      source: token,
    });

    // this can be used if we want to display a payment to our customers
    const payment = Payment.build({
      orderId,
      stripeId: charge.id,
    });
    await payment.save();

    // we could also await the publish if we wanted to wait for the
    // event to be published before we returned the 201 as a response
    // to this endpoint
    new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
