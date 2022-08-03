import express from 'express';

// express-async-errors lets us use the throw keyword in async handlers
// by default, express can't handle throw statements inside async functions,
// we would need to use the next function and pass the error there instead of
// throwing it
import 'express-async-errors';
import { json } from 'body-parser';

import mongoose from 'mongoose';
import cookieSession from 'cookie-session';

import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { errorHandler } from './middlewares/error-handler';
import { NotFoundError } from './errors/not-found-error';

const app = express();
// we set trust proxy to true because traffic is proxied to our application
// through nginx and express would block it by default
app.set('trust proxy', true);

app.use(json());
app.use(
  cookieSession({
    // we're disabling encryption because JWTs are already encrypted
    // and it's hard for some programming languages to decrypt
    // cookie-session's encryption
    signed: false,
    secure: true,
  })
);

// app.get('/', (req, res) => {
//   res.send('hello there');
// });

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

// app.app is a combination of app.get, app.post, app.delete, etc
// it basically responds to any request method
app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY env variable must be defined');
  }
  // here we need to pass the url to the mongodb service running in our pod.
  // For that we need to go through the cluster-ip-service that serves
  // as a communication bridge to the service. The domain is defined
  // in the service config (auth-mongo-deply.yaml, in the service section)
  // metadata -> name: auth-mongo-srv
  // the last parameter (auth) is the name of the db we want to
  // connect to inside our cluster. If the db doesn't exist
  // mongodb will create one for us
  try {
    await mongoose.connect('mongodb://auth-mongo-srv:27017/auth');
    console.log('connected to db');
  } catch (e) {
    console.error(e);
  }
  app.listen(3000, () => {
    console.log('listening on port 3000');
  });
};

// the reason we wrap this in a start setup function is because
// some versions of node don't support async functions at the
// top level

start();
