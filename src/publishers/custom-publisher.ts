import {Publisher} from './publisher';
import {Injectable} from 'conditional-injector';
import {Protocol} from '../protocols/protocol';
import {Store} from '../configurations/store';
import {Logger} from '../loggers/logger';
import {PublisherModel} from '../models/inputs/publisher-model';

const protocol = new Protocol('custom')
    .registerAsPublisher();

@Injectable({predicate: (publisher: any) => protocol.matches(publisher.type)})
export class CustomPublisher extends Publisher {

    constructor(model: PublisherModel) {
        super(model);
    }

    public async publish(): Promise<void> {
        const module = await import(this.implementation) as any;
        return module.publish(this, Store.getData(), Logger);
    }

}
