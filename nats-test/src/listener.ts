import nats, { Message, Stan } from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { TicketCreatedListener } from './events/ticket-created-listener';

console.clear();

const client = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

client.on('connect', () => {
  client.on('close', () => {
    console.log('NATS connection closed');
    process.exit();
  });

  new TicketCreatedListener(client).listen();
  console.log('listener connected to nats');
});

// these callbacks are fired right before we kill our process
// we use them to close our NATS client first to prevent
// the event bus from keeping them around for a few seconds
// after we've killed the process
process.on('SIGINT', () => client.close());
process.on('SIGTERM', () => client.close());
