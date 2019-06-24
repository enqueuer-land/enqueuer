import {Protocol, ProtocolType} from './protocol';
import {PublisherModel} from '../models/inputs/publisher-model';
import {Publisher} from '../publishers/publisher';
import {ProtocolDocumentation} from './protocol-documentation';

export class PublisherProtocol extends Protocol {
    private readonly createFunction: (publisherModel: PublisherModel) => Publisher;

    public constructor(name: string,
                       createFunction: (publisherModel: PublisherModel) => Publisher,
                       documentation?: ProtocolDocumentation) {
        super(name, ProtocolType.PUBLISHER, documentation);
        this.createFunction = createFunction;
    }

    public create(publisher: PublisherModel): Publisher {
        return this.createFunction(publisher);
    }
}
