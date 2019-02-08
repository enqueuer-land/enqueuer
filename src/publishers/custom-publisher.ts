import {Publisher} from './publisher';
import {Injectable} from 'conditional-injector';
import {Protocol} from '../protocols/protocol';
import {Store} from '../configurations/store';
import {Logger} from '../loggers/logger';
import {PublisherModel} from '../models/inputs/publisher-model';
import * as fs from 'fs';
import requireFromString from 'require-from-string';

const protocol = new Protocol('custom')
    .registerAsPublisher();

@Injectable({predicate: (publisher: any) => protocol.matches(publisher.type)})
export class CustomPublisher extends Publisher {

    constructor(model: PublisherModel) {
        super(model);
        this.model = model;
    }

    public async publish(): Promise<void> {
        try {
            const moduleString: string = fs.readFileSync(this.module).toString();
            const module = requireFromString(moduleString);
            const custom = new module.Publisher(this.model);
            this.messageReceived = await custom.publish({store: Store.getData(), logger: Logger});
        } catch (err) {
            Logger.error(`Error loading module '${this.module}': ${err}`);
        }
    }

}
