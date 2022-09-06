import nats from 'node-nats-streaming';

console.clear();

const client = nats.connect('ticketing', '123', {
  url: 'http://localhost:4222',
});

client.on('connect', () => {
  console.log('listener connected to nats');

  const subscription = client.subscribe('ticket:created');

  subscription.on('message', msg => {
    console.log('message received');
  });
});
