import {
  Publisher,
  OrderCancelledEvent,
  Subjects,
} from '@ng-ticketing-app/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
