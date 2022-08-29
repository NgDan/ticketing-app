import request from 'supertest';
import { app } from '../../app';
import { createSessionCookie } from '../../test/setup';

const createTicket = ({ title, price }: { title: string; price: number }) =>
  request(app)
    .post('/api/tickets')
    .set('Cookie', createSessionCookie())
    .send({ title, price });

it('should fetch a list of tickets', async () => {
  // seed db with tickets
  await createTicket({ title: 'New Ticket 1', price: 20 });
  await createTicket({ title: 'New Ticket 2', price: 25 });
  await createTicket({ title: 'New Ticket 3', price: 35 });

  const response = await request(app).get('/api/tickets').send().expect(200);

  console.log(response.body);

  expect(response.body.length).toEqual(3);
});
