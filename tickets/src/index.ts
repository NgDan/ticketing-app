import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY env variable must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI env variable must be defined');
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
    await natsWrapper.connect(
      'ticketing',
      'some-random-string-7632547623',
      'http://nats-srv:4222'
    );
    await mongoose.connect(process.env.MONGO_URI);
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
