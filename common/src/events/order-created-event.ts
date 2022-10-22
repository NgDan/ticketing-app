import { Subjects } from './subjects';
import { OrderStatus } from './types/order-status';

// we only want to put the relevant to other services data in our event
export interface OrderCreatedEvent {
  subject: Subjects.OrderCreated;
  data: {
    id: string;
    userId: string;
    status: OrderStatus;
    expiresAt: string;
    ticket: {
      id: string;
      price: number;
    };
  };
}
