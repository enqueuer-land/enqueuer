import { Protocol, ProtocolType } from './protocol';
import { SensorModel } from '../models/inputs/sensor-model';
import { Sensor } from '../sensors/sensor';
import { ProtocolDocumentation } from './protocol-documentation';

export class SensorProtocol extends Protocol {
  private readonly createFunction: (sensorModel: SensorModel) => Sensor;

  public constructor(
    name: string,
    createFunction: (sensorModel: SensorModel) => Sensor,
    documentation?: ProtocolDocumentation
  ) {
    super(name, ProtocolType.SUBSCRIPTION, documentation);
    this.createFunction = createFunction;
  }

  public create(sensor: SensorModel): Sensor {
    return this.createFunction(sensor);
  }
}
