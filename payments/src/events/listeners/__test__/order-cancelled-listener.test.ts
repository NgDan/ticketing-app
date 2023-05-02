import { OrderCancelledListener } from '../order-cancelled-listener';
import { Message } from 'node-nats-streaming';
import { OrderStatus, OrderCancelledEvent } from '@ng-ticketing-app/common';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';
import mongoose from 'mongoose';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 10,
    userId: 'sadfasdfas',
    version: 0,
  });

  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
      id: 'asdfsadf',
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { data, listener, msg, order };
};

it('updates the status of the order', async () => {
  const { data, listener, msg, order } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById({
    _id: order.id,
  });

  expect(updatedOrder!.status).toBe(OrderStatus.Cancelled);
});
it('acknowledges the message', async () => {
  const { data, listener, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
