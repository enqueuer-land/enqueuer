const dgram = require('dgram');

class Sensor {
  constructor(sensor) {
    this.sensor = sensor;
  }

  prepare(context) {
    return new Promise((resolve, reject) => {
      this.server = dgram.createSocket('udp4');
      try {
        this.server.bind(this.sensor.port);
        resolve();
      } catch (err) {
        const message = `Udp server could not listen to ${this.sensor.port}`;
        context.logger.error(message);
        reject(message);
      }
    });
  }

  receiveMessage(context) {
    return new Promise((resolve, reject) => {
      this.server.on('error', err => {
        this.server.close();
        reject(err);
      });

      this.server.on('message', (msg, remoteInfo) => {
        this.server.close();
        this.sensor.executeHookEvent('onMessageReceived', {
          payload: msg,
          remoteInfo: remoteInfo
        });
        resolve();
      });
    });
  }
}

class Actuator {
  constructor(actuator) {
    this.actuator = actuator;
  }

  act(context) {
    return new Promise((resolve, reject) => {
      const client = dgram.createSocket('udp4');
      context.logger.debug('Udp client trying to send message');

      client.send(Buffer.from(this.actuator.payload), this.actuator.port, this.actuator.serverAddress, error => {
        if (error) {
          client.close();
          reject(error);
          return;
        }
        context.logger.debug('Udp client sent message');
        resolve();
      });
    });
  }
}

module.exports = { Sensor, Actuator };
