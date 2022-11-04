import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { Order, OrderStatus } from './order';

// this model SHOULD NOT be identical to the one in tickets models.
// Our service, even if it needs to duplicate the tickets data in its own
// database, it's doing a partial duplication, it doesn't need all the attributes
// from the tickets model, only the attributes relevant to an order.

interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.findByEvent = (event: { id: string; version: number }) =>
  Ticket.findOne({ _id: event.id, version: event.version - 1 });

ticketSchema.statics.build = (attrs: TicketAttrs) =>
  new Ticket({
    // we need to save the id as _id otherwise mongo will assign this record its own _id
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });

// important! this should not be an arrow function
ticketSchema.methods.isReserved = async function () {
  // run query to look at all orders. Find order where the ticket matches the one this
  // request is interested in *and* the order status is *not* cancelled.
  // If we find an order from that means the ticket *is* reserved.
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });
  // return just a boolean not the whole order
  return !!existingOrder;
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
