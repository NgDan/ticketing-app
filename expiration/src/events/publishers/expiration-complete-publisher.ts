import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from '@ng-ticketing-app/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
