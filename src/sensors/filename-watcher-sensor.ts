import { Sensor } from './sensor';
import { Logger } from '../loggers/logger';
import { SensorModel } from '../models/inputs/sensor-model';
import * as fs from 'fs';
import * as glob from 'glob';
import { MainInstance } from '../plugins/main-instance';
import { SensorProtocol } from '../protocols/sensor-protocol';

class FileSystemWatcherSensor extends Sensor {
  constructor(sensorAttributes: SensorModel) {
    super(sensorAttributes);
    this.options = sensorAttributes.options || { nodir: true };
  }

  public mount(): Promise<void> {
    return Promise.resolve();
  }

  public async receiveMessage(): Promise<void> {
    return new Promise((resolve, reject) => {
      let interval = setInterval(() => {
        const files = glob.sync(this.fileNamePattern, this.options);
        if (files.length > 0) {
          const filename = files[0];
          try {
            this.executeHookEvent('onMessageReceived', this.extractFileInformation(filename));
            resolve();
          } catch (error) {
            Logger.warning(`Error reading file ${filename}: ${error}`);
            reject(error);
          }
          clearInterval(interval);
        }
      }, 50);
    });
  }

  private extractFileInformation(filename: string) {
    const stat = fs.lstatSync(filename);
    return {
      content: fs.readFileSync(filename).toString(),
      name: filename,
      size: stat.size,
      modified: stat.mtime,
      created: stat.ctime
    };
  }
}

export function entryPoint(mainInstance: MainInstance): void {
  const protocol = new SensorProtocol('file', (sensorModel: SensorModel) => new FileSystemWatcherSensor(sensorModel), {
    description: 'The file sensor provides an implementation of filesystem readers',
    libraryHomepage: 'https://github.com/isaacs/node-glob',
    schema: {
      attributes: {
        fileNamePattern: {
          description: 'Glob pattern to identify files to be watched',
          required: true,
          type: 'string'
        },
        options: {
          description: 'https://github.com/isaacs/node-glob#options',
          type: 'object',
          required: false
        }
      },
      hooks: {
        onMessageReceived: {
          arguments: {
            name: {},
            content: {},
            size: {},
            modified: {},
            created: {}
          }
        }
      }
    }
  }).addAlternativeName('file-system-watcher', 'file-watcher');

  mainInstance.protocolManager.addProtocol(protocol);
}
