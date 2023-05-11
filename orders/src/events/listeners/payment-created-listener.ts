import {
  Listener,
  OrderStatus,
  PaymentCreatedEvent,
  Subjects,
} from '@ng-ticketing-app/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) throw new Error('Order not found');

    order.set({
      status: OrderStatus.Complete,
    });
    await order.save();

    // ideally we would emit an "OrderUpdated" event after we update the order but
    // we don't expect any other services to make any further modifications on this
    // order after it's status is "complete"
    msg.ack();
  }
}
