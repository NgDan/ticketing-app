import express from 'express';

// express-async-errors lets us use the throw keyword in async handlers
// by default, express can't handle throw statements inside async functions,
// we would need to use the next function and pass the error there instead of
// throwing it
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { createTicketRouter } from './routes/new';
import { showTicketRouter } from './routes/show';
import { indexTicketRouter } from './routes/index';
import {
  errorHandler,
  NotFoundError,
  currentUser,
  requireAuth,
} from '@ng-ticketing-app/common';
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
    // only use https (secure: true) in prod, because our test library supertest
    // uses http
    secure: process.env.NODE_ENV !== 'test',
  })
);

app.use(currentUser);
app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);

// app.all is a combination of app.get, app.post, app.delete, etc
// it basically responds to any request method
app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
