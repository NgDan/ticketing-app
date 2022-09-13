import nats, { Message, Stan } from 'node-nats-streaming';
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

  new TicketCreatedListener(client).listen();
  console.log('listener connected to nats');
});

// these callbacks are fired right before we kill our process
// we use them to close our NATS client first to prevent
// the event bus from keeping them around for a few seconds
// after we've killed the process
process.on('SIGINT', () => client.close());
process.on('SIGTERM', () => client.close());

abstract class Listener {
  abstract subject: string;
  // queue groups tell the streaming service to only send one
  // event to the members of that queue group. This is helpful
  // when we have multiple instances of the same service running
  // in parallel for scaling purposes but we don't want the
  // event sent to all the instances because that would result
  // in duplicate processing. For example, a ticket service that saves
  // tickets in a db as a response to an event would duplicate
  // tickets saved in the db if all the instances were to process
  // the same event
  abstract queueGroupName: string;
  private client: Stan;
  protected ackWait = 5 * 1000;
  abstract onMessage(data: any, msg: Message): void;

  constructor(client: Stan) {
    this.client = client;
  }

  subscriptionOptions() {
    return (
      this.client
        .subscriptionOptions()
        .setDeliverAllAvailable()
        .setManualAckMode(true)
        // Ack stands for acknowledgement. This enables us to manually confirm we've
        // processed an event so the event bus can dispose it. Without manual
        // confirmation (acknowledgement), we risk losing important data if
        // some event isn't processed due to some failure (db failure, error in our
        // own code, etc). If the event bus doesn't receive an acknowledgement for
        // an event, it's going to wait a certain amount of time and re-emit that
        // event again so we have another chance at processing it.
        .setAckWait(this.ackWait)
        // this option enables NATS to save a copy of each event emitted
        // for a queue group and store it internally. If the service that
        // processes that event acknowledges it, it will mark that event
        // as "processed" internally. If a service goes down, and restarts
        // at some point in the future, NATS then will re-emit all the events
        // that haven't been marked as "processed" to the service so it has
        // a chance to process them again.
        .setDurableName(this.queueGroupName)
    );
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    );
    subscription.on('message', (msg: Message) => {
      console.log(`message received: ${msg} / ${this.queueGroupName}`);
      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  }

  parseMessage(msg: Message) {
    const data = msg.getData();

    return typeof data === 'string'
      ? JSON.parse(data)
      : JSON.parse(data.toString('utf8'));
  }
}

class TicketCreatedListener extends Listener {
  subject = 'ticket:created';
  queueGroupName = 'payments-service';

  onMessage(data: any, msg: Message) {
    console.log('Event data: ', data);

    // after we succesfully process the message
    msg.ack();
  }
}
