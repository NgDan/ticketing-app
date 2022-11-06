import {
  Listener,
  OrderCreatedEvent,
  Subjects,
} from '@ng-ticketing-app/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
import { queueGroupName } from './queue-group-name';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // if no ticket, throw error
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // mark the ticket as being reserved by setting its orderId property
    ticket.set({ orderId: data.id });

    // save the ticket
    await ticket.save();

    // raise event to let any service know that this ticket has been updated. Otherwise their version property in the database will become stale
    // also make sure you await this so we don't acknowledge the event on the next line in case the publishing fails
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      version: ticket.version,
      userId: ticket.userId,
      orderId: ticket.orderId,
    });

    // acknowledge the message
    msg.ack();
  }
}
