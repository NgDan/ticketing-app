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
  onMessage(data: TicketCreatedEvent['data'], msg: Message) {}
}
