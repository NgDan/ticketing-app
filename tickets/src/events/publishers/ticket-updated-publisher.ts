import { Publisher } from '@ng-ticketing-app/common';
import { TicketUpdatedEvent } from '@ng-ticketing-app/common';
import { Subjects } from '@ng-ticketing-app/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
