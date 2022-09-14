import { Publisher } from '@ng-ticketing-app/common';
import { TicketCreatedEvent } from '@ng-ticketing-app/common';
import { Subjects } from '@ng-ticketing-app/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
