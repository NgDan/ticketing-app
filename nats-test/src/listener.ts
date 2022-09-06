import nats, { Message } from 'node-nats-streaming';
import { randomBytes } from 'crypto';

console.clear();

const client = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

client.on('connect', () => {
  console.log('listener connected to nats');

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
    'orders-service-queue-group'
  );

  subscription.on('message', (msg: Message) => {
    const data = msg.getData();
    // getData() returns either a string or a buffer
    if (typeof data === 'string') {
      console.log('message sequence', msg.getSequence());
      console.log('message data', JSON.parse(data));
    }
  });
});
