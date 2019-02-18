import {Protocol, ProtocolType} from './protocol';
import {PublisherModel} from '../models/inputs/publisher-model';
import {Publisher} from '../publishers/publisher';

export class PublisherProtocol extends Protocol {
    private readonly messageReceivedParams: string[];
    private readonly createFunction: (publisherModel: PublisherModel) => Publisher;

    public constructor(name: string, createFunction: (publisherModel: PublisherModel) => Publisher, messageReceivedParams: string[] = []) {
        super(name, ProtocolType.PUBLISHER);
        this.createFunction = createFunction;
        this.messageReceivedParams = messageReceivedParams;
    }

    public create(publisher: PublisherModel): Publisher {
        return this.createFunction(publisher);
    }

    protected getDeepDescription(): any {
        return {
            messageReceivedParams: this.messageReceivedParams
        };
    }
}
