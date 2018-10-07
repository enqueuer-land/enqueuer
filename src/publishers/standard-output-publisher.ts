import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import {Injectable} from 'conditional-injector';
import prettyjson from 'prettyjson';
import {Logger} from '../loggers/logger';
import {Json} from '../object-notations/json';
import {Protocol} from '../protocols/protocol';

const options = {
    defaultIndentation: 4,
    keysColor: 'white',
    dashColor: 'grey'
  };

const protocol = new Protocol('stdout')
    .addAlternativeName('standard-output')
    .registerAsPublisher();

@Injectable({predicate: (publish: any) => protocol.matches(publish.type)})
export class StandardOutputPublisher extends Publisher {

    public constructor(publisherProperties: PublisherModel) {
        super(publisherProperties);
        this.pretty = !!this.pretty;
    }

    public publish(): Promise<void> {
        if (typeof(this.payload) === 'object') {
            this.payload = new Json().stringify(this.payload);
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
            const parsed = new Json().parse(this.payload);
            return prettyjson.render(parsed, options);
        } catch (err) {
            Logger.debug(`${this.type} can not prettyfy string`);
            return this.payload;
        }
    }
}