import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from '@ng-ticketing-app/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
