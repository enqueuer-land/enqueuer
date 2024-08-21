import { Sensor } from './sensor';
import { SensorModel } from '../models/inputs/sensor-model';

export class NullSensor extends Sensor {
  constructor(sensorAttributes: SensorModel) {
    super(sensorAttributes);
  }

  public prepare(): Promise<void> {
    return Promise.reject(`Undefined sensor: '${this.type}'`);
  }

  public async receiveMessage(): Promise<void> {
    return Promise.reject(`Undefined sensor: '${this.type}'`);
  }
}