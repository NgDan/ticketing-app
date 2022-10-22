import {
  Publisher,
  OrderCreatedEvent,
  Subjects,
} from '@ng-ticketing-app/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
