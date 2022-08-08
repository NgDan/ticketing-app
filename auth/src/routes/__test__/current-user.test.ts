import request from 'supertest';
import { app } from '../../app';
import { signup } from '../../utilities/signup';

it('responds with details about the current user', async () => {
  // supertest doesn't attach the cookie automatically like the browser so
  // we have to attach it manually to the followup requests
  const cookie = await signup();

  const response = await request(app)
    .get('/api/users/currentuser')
    // attach cookie from signup request
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual('test@test.com');
});

it('responds with null if not authenticated', async () => {
  const response = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
});
