import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import {IdGenerator} from '../strings/id-generator';
import * as fs from 'fs';
import {MainInstance} from '../plugins/main-instance';
import {PublisherProtocol} from '../protocols/publisher-protocol';

class FilePublisher extends Publisher {

    constructor(publisherAttributes: PublisherModel) {
        super(publisherAttributes);
        this.filenameExtension = this.filenameExtension || 'enq';
    }

    public publish(): Promise<void> {
        const filename = this.getFileName();
        let value = this.payload;

        if (typeof(value) === 'object') {
            value = JSON.stringify(value, null, 2);
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

export function entryPoint(mainInstance: MainInstance): void {
    const protocol = new PublisherProtocol('file',
        (publisherModel: PublisherModel) => new FilePublisher(publisherModel));

    mainInstance.protocolManager.addProtocol(protocol);
}
