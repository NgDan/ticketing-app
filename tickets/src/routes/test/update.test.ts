import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { createSessionCookie } from '../../test/setup';

it("returns a 404 if the provided id doesn't exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', createSessionCookie())
    .send({ title: 'New title', price: 20 })
    .expect(404);
});
it('returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({ title: 'New title', price: 20 })
    .expect(401);
});
it('returns a 401 if the user does not own a ticket', async () => {
  const response = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', createSessionCookie())
    .send({ title: 'New title', price: 20 })
    .expect(201);

  const ticketId = response.body.id;

  const newUserId = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set('Cookie', createSessionCookie(newUserId))
    .send({ title: 'New title 2', price: 25 })
    .expect(401);
});
it('returns a 400 if the user provides an invalid title or price', async () => {});
it('updates the tickets provided valid inputs', async () => {});
