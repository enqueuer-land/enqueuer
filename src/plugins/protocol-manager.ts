import { ActuatorModel } from '../models/inputs/actuator-model';
import { Actuator } from '../actuators/actuator';
import { SensorModel } from '../models/inputs/sensor-model';
import { Sensor } from '../sensors/sensor';
import { NullSensor } from '../sensors/null-sensor';
import { NullActuator } from '../actuators/null-actuator';
import { Protocol } from '../protocols/protocol';
import { ActuatorProtocol } from '../protocols/actuator-protocol';
import { SensorProtocol } from '../protocols/sensor-protocol';
import { Logger } from '../loggers/logger';
import { prettifyJson } from '../outputs/prettify-json';

export class ProtocolManager {
  private protocols: Protocol[] = [];

  public createActuator(actuatorModel: ActuatorModel): Actuator {
    const matchingActuators = this.protocols
      .filter((protocol: Protocol) => protocol.isActuator())
      .filter((protocol: Protocol) => protocol.matches(actuatorModel.type))
      .map((protocol: Protocol) => (protocol as ActuatorProtocol).create(actuatorModel));
    if (matchingActuators.length > 0) {
      return matchingActuators[0];
    }
    Logger.error(`No actuator was found with '${actuatorModel.type}'`);
    return new NullActuator(actuatorModel);
  }

  public createSensor(sensorModel: SensorModel): Sensor {
    const matchingSensors = this.protocols
      .filter((protocol: Protocol) => protocol.isSensor())
      .filter((protocol: Protocol) => protocol.matches(sensorModel.type))
      .map((protocol: Protocol) => (protocol as SensorProtocol).create(sensorModel));
    if (matchingSensors.length > 0) {
      return matchingSensors[0];
    }
    Logger.error(`No sensor was found with '${sensorModel.type}'`);
    return new NullSensor(sensorModel);
  }

  public addProtocol(protocol: Protocol): void {
    this.protocols.push(protocol);
  }

  public describeMatchingProtocols(description: string = ''): boolean {
    const matchingProtocols = this.getProtocolsDescription(description);
    console.log(`Describing protocols matching: ${description}`);
    console.log(prettifyJson(matchingProtocols));
    return matchingProtocols.actuators.length + matchingProtocols.sensors.length > 0;
  }

  public getProtocolsDescription(protocol: string = ''): {
    actuators: {}[];
    sensors: {}[];
  } {
    return {
      actuators: this.protocols
        //NOTE: function check for retro compatibilities proposes
        .filter((protocol: Protocol) => protocol.isActuator && protocol.isActuator())
        .filter((actuator: Protocol) => actuator.matches(protocol))
        .map(protocol => protocol.getDescription()),
      sensors: this.protocols
        //NOTE: function check for retro compatibilities proposes
        .filter((protocol: Protocol) => protocol.isSensor && protocol.isSensor())
        .filter((sensor: Protocol) => sensor.matches(protocol))
        .map(protocol => protocol.getDescription())
    };
  }
}
