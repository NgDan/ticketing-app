import client, { Stan } from 'node-nats-streaming';

class NatsWrapper {
  private _client?: Stan;

  get client() {
    if (!this._client) {
      throw new Error('Cannot access NATS client before connecting');
    }

    return this._client;
  }

  connect(clusterId: string, clientId: string, url: string) {
    this._client = client.connect(clusterId, clientId, { url });

    return new Promise<void>((resolve, reject) => {
      this._client!.on('connect', () => {
        console.log('Connected to NATS');
        resolve();
      });

      this._client!.on('error', error => {
        console.log('Error connecting to NATS: ', error);
        reject(error);
      });
    });
  }
}

export const natsWrapper = new NatsWrapper();
