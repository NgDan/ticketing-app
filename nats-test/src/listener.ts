import nats, { Message } from 'node-nats-streaming';
import { randomBytes } from 'crypto';

console.clear();

const client = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

client.on('connect', () => {
  client.on('close', () => {
    console.log('NATS connection closed');
    process.exit();
  });

  console.log('listener connected to nats');

  // Ack stands for acknowledgement. This enables us to manually confirm we've
  // processed an event so the event bus can dispose it. Without manual
  // confirmation (acknowledgement), we risk losing important data if
  // some event isn't processed due to some failure (db failure, error in our
  // own code, etc). If the event bus doesn't receive an acknowledgement for
  // an event, it's going to wait a certain amount of time and re-emit that
  // event again so we have another chance at processing it.
  const options = client.subscriptionOptions().setManualAckMode(true);

  const subscription = client.subscribe(
    'ticket:created',
    // queue groups tell the streaming service to only send one
    // event to the members of that queue group. This is helpful
    // when we have multiple instances of the same service running
    // in parallel for scaling purposes but we don't want the
    // event sent to all the instances because that would result
    // in duplicate processing. For example, a ticket service that saves
    // tickets in a db as a response to an event would duplicate
    // tickets saved in the db if all the instances were to process
    // the same event
    'orders-service-queue-group',
    options
  );

  subscription.on('message', (msg: Message) => {
    const data = msg.getData();
    // getData() returns either a string or a buffer
    if (typeof data === 'string') {
      console.log('message sequence', msg.getSequence());
      console.log('message data', JSON.parse(data));
    }
    // confirm we've finished processing the event (happy path)
    msg.ack();
  });
});

// these callbacks are fired right before we kill our process
// we use them to close our NATS client first to prevent
// the event bus from keeping them around for a few seconds
// after we've killed the process
process.on('SIGINT', () => client.close());
process.on('SIGTERM', () => client.close());
