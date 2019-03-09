import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import {MainInstance} from '../plugins/main-instance';
import {PublisherProtocol} from '../protocols/publisher-protocol';
import {JsonObjectParser} from '../object-parser/json-object-parser';

class StandardOutputPublisher extends Publisher {

    public constructor(publisherProperties: PublisherModel) {
        super(publisherProperties);
    }

    public publish(): Promise<void> {
        if (typeof(this.payload) === 'object') {
            this.payload = new JsonObjectParser().stringify(this.payload);
        }
        console.log(this.payload);
        return Promise.resolve();
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    const protocol = new PublisherProtocol('stdout',
        (publisherModel: PublisherModel) => new StandardOutputPublisher(publisherModel))
        .addAlternativeName('standard-output');

    mainInstance.protocolManager.addProtocol(protocol);
}
