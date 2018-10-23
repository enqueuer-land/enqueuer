import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import {Injectable} from 'conditional-injector';
import {Json} from '../object-notations/json';
import {Protocol} from '../protocols/protocol';

const protocol = new Protocol('stdout')
    .addAlternativeName('standard-output')
    .registerAsPublisher();

@Injectable({predicate: (publish: any) => protocol.matches(publish.type)})
export class StandardOutputPublisher extends Publisher {

    public constructor(publisherProperties: PublisherModel) {
        super(publisherProperties);
    }

    public publish(): Promise<void> {
        if (typeof(this.payload) === 'object') {
            this.payload = new Json().stringify(this.payload);
        }
        console.log(this.payload);
        return Promise.resolve();
    }
}
