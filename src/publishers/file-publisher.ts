import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import {IdGenerator} from '../strings/id-generator';
import {Injectable} from 'conditional-injector';
import * as fs from 'fs';
import {Json} from '../object-notations/json';
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

        fs.writeFileSync(filename, value);
        return Promise.resolve();
    }

    private getFileName() {
        if (this.filename) {
            return this.filename;
        }
        return this.createFileName();
    }

    private createFileName() {
        let filename = this.filenamePrefix + new IdGenerator(this.payload).generateId();
        const needsToInsertDot = filename.lastIndexOf('.') == -1 && this.filenameExtension.lastIndexOf('.') == -1;
        if (needsToInsertDot) {
            filename += '.';
        }
        return filename + this.filenameExtension;
    }
}
