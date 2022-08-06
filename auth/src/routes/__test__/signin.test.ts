import request from 'supertest';
import { app } from '../../app';

it('fails when providing unexisting email', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'verysecurepassword',
    })
    .expect(400);
});

it('fails when providing incorrect password', async () => {
  // create user
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'verysecurepassword',
    })
    .expect(201);

  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'incorectpassword',
    })
    .expect(400);
});

it('responds with a cookie when given valid credentials', async () => {
  // create user
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'verysecurepassword',
    })
    .expect(201);

  // signin
  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'verysecurepassword',
    })
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});
