import request from 'supertest';
import { app } from '../../app';
import { createSessionCookie } from '../../test/setup';

it('has a route handler listening to /api/tickets for post requests', async () => {
  const response = await request(app).post('/api/tickets').send({});

  expect(response.status).not.toEqual(404);
});
it('can only be accessed if the user is signed in', async () => {
  const response = await request(app).post('/api/tickets').send({});

  expect(response.status).toEqual(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  // here we could call /api/users/signup and get the auth cookie from the
  // auth service but we don't want to create interservice dependencies
  // so we're going to generate the cookie ourselves and attach it to the
  // request manually
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', createSessionCookie())
    .send({});

  expect(response.status).not.toEqual(401);
});
it('returns an error if an invalid title is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', createSessionCookie())
    .send({
      title: '',
      price: 10,
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', createSessionCookie())
    .send({
      price: 10,
    })
    .expect(400);
});
it('returns an error if an invalid price is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', createSessionCookie())
    .send({
      title: 'Test title',
      price: -10,
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', createSessionCookie())
    .send({
      title: 'Test title',
    })
    .expect(400);
});
it('creates a tickets with valid inputs', async () => {
  // TODO add in a check other than a 201 to make sure a ticket was saved
  await request(app)
    .post('/api/tickets')
    .send({ title: 'Test title', price: 20 })
    .expect(201);
});
