import { Publisher } from './publisher';
import { PublisherModel } from '../models/inputs/publisher-model';
import { MainInstance } from '../plugins/main-instance';
import { PublisherProtocol } from '../protocols/publisher-protocol';

class StandardOutputPublisher extends Publisher {
  public constructor(publisherProperties: PublisherModel) {
    super(publisherProperties);
  }

  public publish(): Promise<void> {
    if (typeof this.payload === 'object') {
      this.payload = JSON.stringify(this.payload, null, 2);
    }
    console.log(this.payload);
    return Promise.resolve();
  }
}

export function entryPoint(mainInstance: MainInstance): void {
  const protocol = new PublisherProtocol(
    'stdout',
    (publisherModel: PublisherModel) => new StandardOutputPublisher(publisherModel),
    {
      schema: {
        attributes: {
          payload: {
            type: 'text',
            required: true
          }
        }
      }
    }
  ).addAlternativeName('standard-output');

  mainInstance.protocolManager.addProtocol(protocol);
}
