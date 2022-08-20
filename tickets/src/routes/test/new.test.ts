import request from 'supertest';
import { app } from '../../app';
import { createSessionCookie } from '../../test/setup';
import { Ticket } from '../../models/ticket';
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
  const title = 'Test title';

  // check db is empty
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  // create a ticket
  await request(app)
    .post('/api/tickets')
    .set('Cookie', createSessionCookie())
    .send({ title, price: 20 })
    .expect(201);

  // check a ticket has been created
  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(20);
  expect(tickets[0].title).toEqual(title);
});
