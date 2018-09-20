import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import {IdGenerator} from '../timers/id-generator';
import {Injectable} from 'conditional-injector';
import * as yaml from 'yamljs';
import * as fs from 'fs';
import {Logger} from '../loggers/logger';
import {YamlObjectNotation} from '../object-notations/yaml-object-notation';
import {JavascriptObjectNotation} from '../object-notations/javascript-object-notation';

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

        if (typeof(value) === 'object') {
            value = new JavascriptObjectNotation().stringify(value);
        }

        if (this.pretty) {
            value = this.markupLanguageString(value, filename);
        }

        fs.writeFileSync(filename, value);
        return Promise.resolve();
    }

    private markupLanguageString(value: string, filename: any) {
        try {
            const parsed = new JavascriptObjectNotation().parse(value);
            if (filename.endsWith('yml') || filename.endsWith('yaml')) {
                Logger.debug(`Stringifying file content '${filename}' as YML`);
                return new YamlObjectNotation().stringify(parsed);
            }

            Logger.debug(`Stringifying file content '${filename}' as JSON`);
            return new JavascriptObjectNotation().stringify(parsed);
        } catch (exc) {
            Logger.debug('Content to write to file is not parseable');
            return value;
        }
    }

    private createFilename() {
        let filename = this.filename;
        if (!filename) {
            filename = this.filenamePrefix;
            filename += this.generateId();
            if (filename.lastIndexOf('.') == -1) {
                if (this.filenameExtension.lastIndexOf('.') == -1) {
                    filename += '.';
                }
                filename += this.filenameExtension;
            }
        }
        return filename;
    }

    private generateId() {
        try {
            //gets everything after last slash
            const name = this.payload.name;
            const id = name.substring(name.lastIndexOf('/'));
            if (id) {
                return id;
            }

        } catch (exc) {
            return new IdGenerator(this.payload).generateId();
        }
    }

}