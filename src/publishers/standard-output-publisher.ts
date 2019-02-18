import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import {Json} from '../object-notations/json';
import {MainInstance} from '../plugins/main-instance';
import {PublisherProtocol} from '../protocols/publisher-protocol';

class StandardOutputPublisher extends Publisher {

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

export function entryPoint(mainInstance: MainInstance): void {
    const protocol = new PublisherProtocol('stdout',
        (publisherModel: PublisherModel) => new StandardOutputPublisher(publisherModel))
        .addAlternativeName('standard-output');

    mainInstance.protocolManager.addProtocol(protocol);
}
