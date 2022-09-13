import { Message } from 'node-nats-streaming';
import { Listener } from './base-listener';
import { Subjects } from './subjects';

export class TicketCreatedListener extends Listener {
  subject = Subjects.TicketCreated;
  queueGroupName = 'payments-service';

  onMessage(data: any, msg: Message) {
    console.log('Event data: ', data);

    // after we succesfully process the message
    msg.ack();
  }
}
