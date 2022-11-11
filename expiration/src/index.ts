import { natsWrapper } from './nats-wrapper';

const start = async () => {
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
  } catch (e) {
    console.error(e);
  }
};

// the reason we wrap this in a start setup function is because
// some versions of node don't support async functions at the
// top level
start();
