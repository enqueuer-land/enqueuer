import { Actuator } from './actuator';
import { ActuatorModel } from '../models/inputs/actuator-model';
import { Logger } from '../loggers/logger';
import * as dgram from 'dgram';
import { ActuatorProtocol } from '../protocols/actuator-protocol';
import { MainInstance } from '../plugins/main-instance';

class UdpActuator extends Actuator {
  constructor(actuatorAttributes: ActuatorModel) {
    super(actuatorAttributes);
  }

  public act(): Promise<void> {
    return new Promise((resolve, reject) => {
      const client = dgram.createSocket('udp4');
      Logger.debug('Udp client trying to send message');

      client.send(Buffer.from(this.payload), this.port, this.serverAddress, (error: any) => {
        if (error) {
          client.close();
          reject(error);
          return;
        }
        Logger.debug('Udp client sent message');
        resolve();
      });
    });
  }
}

export function entryPoint(mainInstance: MainInstance): void {
  const protocol = new ActuatorProtocol('udp', (actuatorModel: ActuatorModel) => new UdpActuator(actuatorModel), {
    description: 'The udp actuator provides an implementation of UDP Datagram sockets clients',
    libraryHomepage: 'https://nodejs.org/api/dgram.html',
    schema: {
      attributes: {
        payload: {
          required: true,
          type: 'text'
        },
        serverAddress: {
          required: true,
          type: 'string'
        },
        port: {
          required: true,
          type: 'int'
        }
      }
    }
  }).addAlternativeName('udp-client');

  mainInstance.protocolManager.addProtocol(protocol);
}
