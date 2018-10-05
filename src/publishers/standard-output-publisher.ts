import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import {Injectable} from 'conditional-injector';
import prettyjson from 'prettyjson';
import {Logger} from '../loggers/logger';
import {JavascriptObjectNotation} from '../object-notations/javascript-object-notation';
import {ProtocolManager} from '../protocols/protocol-manager';

const options = {
    defaultIndentation: 4,
    keysColor: 'white',
    dashColor: 'grey'
  };

const protocol = ProtocolManager.getInstance()
    .insertPublisherProtocol('stdout', ['standard-output']);

@Injectable({predicate: (publish: any) => protocol
        .matchesRatingAtLeast(publish.type, 95)})
export class StandardOutputPublisher extends Publisher {

    public constructor(publisherProperties: PublisherModel) {
        super(publisherProperties);
        this.pretty = !!this.pretty;
    }

    public publish(): Promise<void> {
        if (typeof(this.payload) === 'object') {
            this.payload = new JavascriptObjectNotation().stringify(this.payload);
        }
        if (!this.pretty) {
            console.log(this.payload);
        } else {
            console.log(this.prettyfy());
        }
        return Promise.resolve();
    }

    private prettyfy(): any {
        try {
            const parsed = new JavascriptObjectNotation().parse(this.payload);
            return prettyjson.render(parsed, options);
        } catch (err) {
            Logger.debug(`${this.type} can not prettyfy string`);
            return this.payload;
        }
    }
}