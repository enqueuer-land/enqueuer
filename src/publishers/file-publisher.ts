import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import {IdGenerator} from '../id-generator/id-generator';
import {Injectable} from 'conditional-injector';
import {isNullOrUndefined} from 'util';
import * as yaml from 'yamljs';
import * as fs from 'fs';
import {Logger} from '../loggers/logger';

@Injectable({predicate: (publishRequisition: any) => publishRequisition.type === 'file'})
export class FilePublisher extends Publisher {

    private filename: string;
    private filenamePrefix: string;
    private filenameExtension: string;

    constructor(publisherAttributes: PublisherModel) {
        super(publisherAttributes);
        this.filename = publisherAttributes.filename;
        this.filenamePrefix = publisherAttributes.filenamePrefix;
        this.filenameExtension = publisherAttributes.filenameExtension || 'enq';
    }

    public publish(): Promise<void> {
        let filename = this.createFilename();
        let value = this.payload;
        try {
            const parsedToObject = JSON.parse(this.payload);
            if (this.filenameExtension == 'yml' || this.filenameExtension == 'yaml') {
                value = yaml.stringify(parsedToObject, 10, 2);
            } else  {
                value = JSON.stringify(parsedToObject, null, 2);
            }

        } catch (exc) {
            Logger.info('Content to write a file is not parseable');
        }

        fs.writeFileSync(filename, value);
        return Promise.resolve();
    }

    private createFilename() {
        let filename = this.filename;
        if (!filename) {
            filename = this.filenamePrefix;
            filename += this.generateId();
            filename += '.' + this.filenameExtension;
        }
        return filename;
    }

    private generateId() {
        try {
            const id = JSON.parse(this.payload).id;
            if (!isNullOrUndefined(id)) {
                return id;
            }
        } catch (exc) {
            //do nothing
        }
        return new IdGenerator(this.payload).generateId();
    }
}