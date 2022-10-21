import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from '@ng-ticketing-app/common';
import express, { Request, Response } from 'express';
import { Order } from '../models/order';
import { OrderStatus } from '@ng-ticketing-app/common';

const router = express.Router();

router.delete(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    // if we followed proper REST architecture this DELETE method would've
    // actually deleted the record instead of just marking it as Cancelled
    order.status = OrderStatus.Cancelled;
    await order.save();

    // publish an event to notify this was cancelled

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
