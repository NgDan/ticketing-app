import {
  PaymentCreatedEvent,
  Publisher,
  Subjects,
} from '@ng-ticketing-app/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
