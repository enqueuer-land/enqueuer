import { Actuator } from './actuator';
import { ActuatorModel } from '../models/inputs/actuator-model';
import { IdGenerator } from '../strings/id-generator';
import * as fs from 'fs';
import { MainInstance } from '../plugins/main-instance';
import { ActuatorProtocol } from '../protocols/actuator-protocol';
import { DateController } from '../timers/date-controller';

class FileActuator extends Actuator {
  constructor(actuatorAttributes: ActuatorModel) {
    super(actuatorAttributes);
    this['filenameExtension'] = this.filenameExtension || 'enq';
  }

  public act(): Promise<void> {
    const filename = this.getFileName();
    let value = this.payload;

    if (typeof value === 'object') {
      value = JSON.stringify(value, null, 2);
    }

    fs.writeFileSync(filename, value);
    return Promise.resolve();
  }

  private getFileName() {
    if (this.filename) {
      return this.filename;
    }
    return this.createFileName();
  }

  private createFileName() {
    let filename =
      this.filenamePrefix + new IdGenerator(this.payload || new DateController().getStringOnlyNumbers()).generateId();
    const needsToInsertDot = filename.lastIndexOf('.') == -1 && this.filenameExtension.lastIndexOf('.') == -1;
    if (needsToInsertDot) {
      filename += '.';
    }
    return filename + this.filenameExtension;
  }
}

export function entryPoint(mainInstance: MainInstance): void {
  const protocol = new ActuatorProtocol('file', (actuatorModel: ActuatorModel) => new FileActuator(actuatorModel), {
    description: 'The file actuator provides an implementation of filesystem writers',
    libraryHomepage: 'https://nodejs.org/api/fs.html',
    schema: {
      attributes: {
        filenameExtension: {
          description: 'Used when there is no file name defined, succeeds the auto generated file name',
          required: false,
          type: 'string'
        },
        filenamePrefix: {
          description: 'Used when there is no file name defined, precedes the auto generated file name',
          required: false,
          type: 'string'
        },
        filename: {
          description: 'The file name',
          required: false,
          type: 'string'
        },
        payload: {
          type: 'text',
          required: true
        }
      }
    }
  });
  mainInstance.protocolManager.addProtocol(protocol);
}
