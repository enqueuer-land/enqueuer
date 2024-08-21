import { Sensor } from './sensor';
import { SensorModel } from '../models/inputs/sensor-model';
import { MainInstance } from '../plugins/main-instance';
import { SensorProtocol } from '../protocols/sensor-protocol';

class StandardInputSensor extends Sensor {
  private value?: string;

  constructor(sensorModel: SensorModel) {
    super(sensorModel);
  }

  public receiveMessage(): Promise<void> {
    return new Promise(resolve => {
      process.stdin.on('end', () => {
        if (this.value) {
          resolve();
          this.executeHookEvent('onMessageReceived', { message: this.value });
        }
      });
    });
  }

  public getReady(): Promise<void> {
    process.stdin.setEncoding('utf8');
    process.stdin.resume();
    process.stdin.on('data', chunk => {
      if (!this.value) {
        this.value = chunk.toString();
      } else {
        this.value += chunk;
      }
    });
    return Promise.resolve();
  }

  public async close(): Promise<void> {
    process.stdin.pause();
  }
}

export function entryPoint(mainInstance: MainInstance): void {
  const protocol = new SensorProtocol('stdin', (sensorModel: SensorModel) => new StandardInputSensor(sensorModel), {
    schema: {
      hooks: {
        onMessageReceived: {
          arguments: {
            message: {}
          }
        }
      }
    }
  }).addAlternativeName('standard-input');

  mainInstance.protocolManager.addProtocol(protocol);
}
