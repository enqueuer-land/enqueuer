import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import {IdGenerator} from '../timers/id-generator';
import {Injectable} from 'conditional-injector';
import * as yaml from 'yamljs';
import * as fs from 'fs';
import {Logger} from '../loggers/logger';

@Injectable({predicate: (publishRequisition: any) => publishRequisition.type === 'file'})
export class FilePublisher extends Publisher {

    private readonly filename: string;
    private readonly filenamePrefix: string;
    private readonly filenameExtension: string;
    private readonly pretty: boolean = false;

    constructor(publisherAttributes: PublisherModel) {
        super(publisherAttributes);
        this.pretty = !!publisherAttributes.pretty;
        this.filename = publisherAttributes.filename;
        this.filenamePrefix = publisherAttributes.filenamePrefix;
        this.filenameExtension = publisherAttributes.filenameExtension || 'enq';
    }

    public publish(): Promise<void> {
        const filename = this.createFilename();
        let value = this.payload;
        if (this.pretty && typeof(value) == 'string') {
            value = this.markupLanguageString(value, filename);
        } else if (typeof(value) === 'object') {
            value = this.markupLanguageString(FilePublisher.decycle(value), filename);
        }

        fs.writeFileSync(filename, value);
        return Promise.resolve();
    }

    private markupLanguageString(value: string, filename: any) {
        try {
            value = JSON.parse(value);
        } catch (exc) {
            Logger.debug('Content to write to file is not parseable');
            return value;
        }

        if (filename.endsWith('yml') || filename.endsWith('yaml')) {
            Logger.debug(`Stringifying file content '${filename}' as YML`);
            return yaml.stringify(value, 10, 2);
        }

        Logger.debug(`Stringifying file content '${filename}' as JSON`);
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
            //gets everything after last slash
            const name = this.payload.name;
            const id = name.substr(name.lastIndexOf('/'));
            if (id) {
                return id;
            }

        } catch (exc) {
            return new IdGenerator(this.payload).generateId();
        }
    }

    //TODO create a class to do this
    private static decycle(decyclable: any): string {
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
        return stringified;
    }

}