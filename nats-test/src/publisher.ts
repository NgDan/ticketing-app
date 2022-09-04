import nats from 'node-nats-streaming';

const client = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222',
});

client.on('connect', () => {
  console.log('publisher conxected to NATS');

  const data = JSON.stringify({
    id: '123',
    title: 'concert',
    price: 20,
  });

  // first argument is the subject (name of channel)
  client.publish('ticket:created', data, () => {
    //this is a cb called when the event has been published
    console.log('event published');
  });
});
