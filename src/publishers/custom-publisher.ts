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
        import(this.module).then((custom) => {
            this.custom = new custom.Publisher(model);
        }).catch((err) => {
           Logger.error(`Error loading module: ${err}`);
        });
    }

    public async publish(): Promise<void> {
        this.messageReceived = await this.custom.publish({store: Store.getData(), logger: Logger});
    }

}
