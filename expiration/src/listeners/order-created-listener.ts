import {
  Listener,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from '@ng-ticketing-app/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queueGroupName';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {}
}
