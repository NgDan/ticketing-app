import request from 'supertest';
import { app } from '../../app';
import { createSessionCookie } from '../../test/setup';
it('returns a 404 if the ticket is not found', async () => {
  await request(app).get('/api/tickets/random-test-id').send().expect(404);
});
it('returns a ticket if the ticket is found', async () => {
  const title = 'Test title';
  const price = 20;
  // create ticket
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', createSessionCookie())
    .send({ title, price })
    .expect(201);

  await request(app).get(`/api/tickets/${response.body.id}`).send().expect(200);
  expect(response.body.title).toEqual(title);
  expect(response.body.price).toEqual(price);
});
