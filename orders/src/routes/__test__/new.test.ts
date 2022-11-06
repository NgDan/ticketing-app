import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { createSessionCookie } from '../../test/setup';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('returns an error if the ticket does not exist', async () => {
  // we need to create an id with a valid format not just a random string
  const ticketId = new mongoose.Types.ObjectId();

  await request(app)
    .post('/api/orders')
    .set('Cookie', createSessionCookie())
    .send({ ticketId })
    .expect(404);
});
it('returns an error if the ticket is already reserved', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();
  const order = Order.build({
    ticket,
    userId: 'random-user-id',
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });

  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', createSessionCookie())
    .send({ ticketId: ticket.id })
    .expect(400);
});
it('reserves a ticket ', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', createSessionCookie())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it('emits an order created event', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', createSessionCookie())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
