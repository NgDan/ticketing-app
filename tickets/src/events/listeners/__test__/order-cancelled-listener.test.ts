import { OrderCancelledEvent } from '@ng-ticketing-app/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancalledListener } from '../order-cancelled-listener';

const setup = async () => {
  const listener = new OrderCancalledListener(natsWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: 'sadfg',
  });
  // we set the orderId separately since the TicketAttrs interface doesn't support the orderId property
  // this is only needed for testing but in the real world app we won't need an orderId to create a ticket
  ticket.set({ orderId });
  await ticket.save();

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, orderId, ticket };
};

// usually this should be 3 different tests
it('updates the ticket, publishes and event and acknowledges a ticket', async () => {
  const { listener, data, msg, orderId, ticket } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
