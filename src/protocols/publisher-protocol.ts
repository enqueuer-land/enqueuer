import {HookEventsDescription, Protocol, ProtocolType} from './protocol';
import {PublisherModel} from '../models/inputs/publisher-model';
import {Publisher} from '../publishers/publisher';

export class PublisherProtocol extends Protocol {
    private readonly createFunction: (publisherModel: PublisherModel) => Publisher;

    public constructor(name: string,
                       createFunction: (publisherModel: PublisherModel) => Publisher,
                       hookEventsDescription: string[] | HookEventsDescription = {}) {
        super(name, ProtocolType.PUBLISHER, hookEventsDescription);
        this.createFunction = createFunction;
    }

    public create(publisher: PublisherModel): Publisher {
        return this.createFunction(publisher);
    }
}
