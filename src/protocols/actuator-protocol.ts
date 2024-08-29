import { Protocol, ProtocolType } from './protocol';
import { ActuatorModel } from '../models/inputs/actuator-model';
import { Actuator } from '../actuators/actuator';
import { ProtocolDocumentation } from './protocol-documentation';

export class ActuatorProtocol extends Protocol {
  private readonly createFunction: (actuatorModel: ActuatorModel) => Actuator;

  public constructor(
    name: string,
    createFunction: (actuatorModel: ActuatorModel) => Actuator,
    documentation?: ProtocolDocumentation
  ) {
    super(name, ProtocolType.ACTUATOR, documentation);
    this.createFunction = createFunction;
  }

  public create(actuator: ActuatorModel): Actuator {
    return this.createFunction(actuator);
  }
}
