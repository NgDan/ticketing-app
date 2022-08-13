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
it('returns an error if an invalid title is provided', async () => {});
it('returns an error if an invalid price is provided', async () => {});
it('creates a tickets with valid inputs', async () => {});
