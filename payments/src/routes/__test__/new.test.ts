import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { createSessionCookie } from '../../test/setup';
import { Order } from '../../models/order';
import { OrderStatus } from '@ng-ticketing-app/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

jest.mock('../../stripe');

const ticketPrice = 20;
it('should throw a 404 when purchasing an order that does not exist', async () => {
  const user = createSessionCookie();
  await request(app)
    .post('/api/payments')
    .set('Cookie', user)
    .send({
      token: 'fsdfasdfa',
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});
it('should throw a 401 when purchasing an order that does not belong to the user', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: ticketPrice,
    status: OrderStatus.Created,
  });
  await order.save();

  const user = createSessionCookie();
  await request(app)
    .post('/api/payments')
    .set('Cookie', user)
    .send({
      token: 'fsdfasdfa',
      orderId: order.id,
    })
    .expect(401);
});
it('should throw a 400 when purchasing a cancelled order', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: ticketPrice,
    status: OrderStatus.Cancelled,
  });
  await order.save();

  const user = createSessionCookie(userId);

  await request(app)
    .post('/api/payments')
    .set('Cookie', user)
    .send({
      token: 'fsdfasdfa',
      orderId: order.id,
    })
    .expect(400);
});

it('returns a 204 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: ticketPrice,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', createSessionCookie(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(chargeOptions.source).toEqual('tok_visa');
  expect(chargeOptions.amount).toEqual(ticketPrice * 100);
  expect(chargeOptions.currency).toEqual('usd');
  expect(chargeOptions.currency).toEqual('usd');
});
