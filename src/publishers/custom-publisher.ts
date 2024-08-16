import { Publisher } from './publisher';
import { Store } from '../configurations/store';
import { Logger } from '../loggers/logger';
import { PublisherModel } from '../models/inputs/publisher-model';
import * as fs from 'fs';
import requireFromString from 'require-from-string';
import { MainInstance } from '../plugins/main-instance';
import { PublisherProtocol } from '../protocols/publisher-protocol';

class CustomPublisher extends Publisher {
  constructor(model: PublisherModel) {
    super(model);
    this['model'] = model;
  }

  public async publish(): Promise<void> {
    try {
      const moduleString: string = fs.readFileSync(this.module).toString();
      const module = requireFromString(moduleString);
      const custom = new module.Publisher(this);
      return await custom.publish({ store: Store.getData(), logger: Logger });
    } catch (err) {
      Logger.error(`Error loading module '${this.module}': ${err}`);
    }
  }
}

export function entryPoint(mainInstance: MainInstance): void {
  const protocol = new PublisherProtocol(
    'custom',
    (publisherModel: PublisherModel) => new CustomPublisher(publisherModel)
  );

  mainInstance.protocolManager.addProtocol(protocol);
}
