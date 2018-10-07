import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import {IdGenerator} from '../strings/id-generator';
import {Injectable} from 'conditional-injector';
import * as yaml from 'yamljs';
import * as fs from 'fs';
import {Logger} from '../loggers/logger';
import {Yaml} from '../object-notations/yaml';
import {Json} from '../object-notations/json';
import * as path from 'path';
import {Protocol} from '../protocols/protocol';

const protocol = new Protocol('file')
    .registerAsPublisher();
@Injectable({predicate: (publish: any) => protocol.matches(publish.type)})
export class FilePublisher extends Publisher {

    constructor(publisherAttributes: PublisherModel) {
        super(publisherAttributes);
        this.filenameExtension = this.filenameExtension || 'enq';
    }

    public publish(): Promise<void> {
        const filename = this.getFileName();
        let value = this.payload;

        if (typeof(value) === 'object') {
            value = new Json().stringify(value);
        }

        if (this.pretty) {
            value = this.markupLanguageString(value, filename);
        }

        fs.writeFileSync(filename, value);
        return Promise.resolve();
    }

    private markupLanguageString(value: string, filename: any) {
        try {
            const parsed = new Json().parse(value);
            if (filename.endsWith('yml') || filename.endsWith('yaml')) {
                Logger.debug(`Stringifying file content '${filename}' as YML`);
                return new Yaml().stringify(parsed);
            }

            Logger.debug(`Stringifying file content '${filename}' as JSON`);
            return new Json().stringify(parsed);
        } catch (exc) {
            Logger.debug('Content to write to file is not parseable');
            return value;
        }
    }

    private getFileName() {
        if (this.filename) {
            return this.filename;
        }
        return this.createFileName();
    }

    private createFileName() {
        let filename = this.filenamePrefix + this.generateId();
        const needsToInsertDot = filename.lastIndexOf('.') == -1 && this.filenameExtension.lastIndexOf('.') == -1;
        if (needsToInsertDot) {
            filename += '.';
        }
        return filename + this.filenameExtension;
    }

    private generateId() {
        try {
            return path.parse(this.payload.name).name;
        } catch (exc) {
            return new IdGenerator(this.payload).generateId();
        }
    }

}