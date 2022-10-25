import { Subjects } from './subjects';

// we only want to put the relevant to other services data in our event
export interface OrderCancelledEvent {
  subject: Subjects.OrderCancelled;
  data: {
    id: string;
    version: number;
    ticket: {
      id: string;
    };
  };
}
