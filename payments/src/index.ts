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

  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID env variable must be defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL env variable must be defined');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID env variable must be defined');
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      // NATS_CLIENT_ID needs to be a random ID. We're going to use the
      // name that kubernetes generates for the pod (k get pods to check
      // the name) as an id. To make the name of a pod available as an env
      // variable in kubernetes we use this syntax (check tickets.depl.yaml):
      // - name: NATS_CLIENT_ID
      //   valueFrom:
      //     fieldRef:
      //       fieldPath: metadata.name
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!');
      // we don't want process.exit inside the class NatsWrapper
      // because we don't want any method to be able to close our
      // entire program.
      process.exit();
    });

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

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
