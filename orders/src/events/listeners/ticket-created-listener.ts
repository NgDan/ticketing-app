import { Message } from 'node-nats-streaming';
import {
  Subjects,
  Listener,
  TicketCreatedEvent,
} from '@ng-ticketing-app/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  // this notation (TicketCreatedEvent['data']) is used to get the type of the data attribute on the TicketCreatedEvent interface
  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    // from this event we get the properties relevant to our
    // orders service and persist them in its own database.
    // this is a case of data replication where we want
    // to duplicate some data accross services so the
    // data is available immediately on request. It also
    // eliminates the need to synchronously call the tickets service
    // for that information
    const { title, price, id } = data;
    const ticket = Ticket.build({
      id,
      title,
      price,
    });
    await ticket.save();

    // only acknowledge the message when we **succesfully** process the event data;
    msg.ack();
  }
}
