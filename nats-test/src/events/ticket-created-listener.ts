import { Message } from 'node-nats-streaming';
import { Listener } from '../../../common/src/events/base-listener';
import { Subjects } from '@ng-ticketing-app/common';
import { TicketCreatedEvent } from '@ng-ticketing-app/common';
export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = 'payments-service';

  onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    console.log('Event data: ', data);

    // after we succesfully process the message
    msg.ack();
  }
}
