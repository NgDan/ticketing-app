import { Ticket } from '../ticket';

it('implments optimistic concurrency control', async () => {
  // create an instance of a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: '123',
  });

  // save instance of ticket to db
  await ticket.save();

  // fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // make two separate changes to the tickets we fetched
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  // save the first fetched ticket
  await firstInstance!.save();

  // save the second fetched ticket and expect an error
  // the try catch block is a trick to expect an error in jest
  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }
  throw new Error('Shout not reach this point');
});

// not a perfect test but it's better than nothing;
it('incerments the version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: '123',
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
