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
        this.filename = this.createFilename();
        let value = this.payload;
        if (typeof(value) == 'string') {
            value = this.markupLanguageString(value);
        } else if (typeof(value) == 'object') {
            value = FilePublisher.decycle(this.payload);
            value = this.markupLanguageString(JSON.stringify(value));
        }

        fs.writeFileSync(this.filename, value);
        return Promise.resolve();
    }

    private markupLanguageString(value: string) {
        try {
            value = JSON.parse(value);
        } catch (exc) {
            Logger.debug('Content to write to file is not parseable');
            return value;
        }

        if (this.filename.endsWith('yml') || this.filename.endsWith('yaml')) {
            Logger.debug(`Stringifying file content '${this.filename}' as YML`);
            return yaml.stringify(value, 10, 2);
        }

        Logger.debug(`Stringifying file content '${this.filename}' as JSON`);
        return JSON.stringify(value, null, 2);
    }

    private createFilename() {
        let filename = this.filename;
        if (!filename) {
            filename = this.filenamePrefix;
            filename += this.generateId();
            if (filename.lastIndexOf('.') == -1) {
                filename += '.' + this.filenameExtension;
            }
        }
        return filename;
    }

    private generateId() {
        try {
            const name = this.payload.name;
            const id = name.substr(name.lastIndexOf('/'));
            if (id) {
                return id;
            }
        } catch (exc) {
            //do nothing
        }
        return new IdGenerator(this.payload).generateId();
    }

    private static decycle(decyclable: any): any {
        const cache = new Map();
        const stringified = JSON.stringify(decyclable, (key, value) => {
            if (typeof(value) === 'object' && value !== null) {
                if (cache.has(value)) {
                    // Circular reference found, discard key
                    return;
                }
                // Store value in our map
                cache.set(value, true);
            }
            return value;
        });
        return JSON.parse(stringified);
    }

}