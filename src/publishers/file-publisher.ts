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
        if (typeof(value) == 'string') {
            value = this.stringifyPayload(value);
        } else if (typeof(value) == 'object') {
            value = this.stringifyPayload(JSON.stringify(value));
        }

        fs.writeFileSync(filename, value);
        return Promise.resolve();
    }

    private stringifyPayload(value: string) {
        try {
            value = JSON.parse(value);
        } catch (exc) {
            Logger.debug('Content to write to file is not parseable');
            return value;
        }

        if (this.filenameExtension == 'yml' || this.filenameExtension == 'yaml') {
            return yaml.stringify(value, 10, 2);
        }

        return JSON.stringify(value, null, 2);
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
            const id = this.payload.id;
            if (id) {
                return id;
            }
        } catch (exc) {
            //do nothing
        }
        return new IdGenerator(this.payload).generateId();
    }
}