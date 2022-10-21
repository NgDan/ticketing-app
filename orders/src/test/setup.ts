import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

jest.mock('../nats-wrapper');

let mongo: any;

beforeAll(async () => {
  // setup secret key env variable
  process.env.JWT_KEY = 'randomsecurekey';

  const mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  // cleanup all the collections before a test
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

export const createSessionCookie = (id = '630fb979da4df5f529949e6f') => {
  // build a JWT payload, { id, email }
  const payload = {
    id,
    email: 'test@test.com',
  };

  // create JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // build session Object. { jwt: MY_JWT }
  const session = { jwt: token };

  // turn session into JSON
  const sessinoJSON = JSON.stringify(session);

  // take JSON and encode it as base64
  const base64 = Buffer.from(sessinoJSON).toString('base64');

  // return a string that's the cookie with the cookie data
  return [`session=${base64}$`];
};
