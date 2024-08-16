import { Publisher } from './publisher';
import { PublisherModel } from '../models/inputs/publisher-model';

export class NullPublisher extends Publisher {
  public constructor(publisherModel: PublisherModel) {
    super(publisherModel);
  }

  public publish(): Promise<void> {
    return Promise.reject(`Undefined publisher: '${this.type}'`);
  }
}
