import {Publisher} from "./publisher";
import {PublisherModel} from "../models/inputs/publisher-model";
import {IdGenerator} from "../id-generator/id-generator";
import {Injectable} from "conditional-injector";
import {isNullOrUndefined} from "util";
const fs = require("fs");

@Injectable({predicate: (publishRequisition: any) => publishRequisition.type === "file"})
export class FilePublisher extends Publisher {

    private filename: string;
    private filenamePrefix: string;
    private filenameExtension: string;

    constructor(publisherAttributes: PublisherModel) {
        super(publisherAttributes);
        this.filename = publisherAttributes.filename;
        this.filenamePrefix = publisherAttributes.filenamePrefix;
        this.filenameExtension = publisherAttributes.filenameExtension || ".enqRun";
    }

    public publish(): Promise<void> {
        let filename = this.createFilename();
        let value = this.payload;
        try {
            value = JSON.stringify(JSON.parse(this.payload), null, 2);
        } catch (exc){}

        fs.writeFileSync(filename, value);
        return Promise.resolve();
    }

    private createFilename() {
        let filename = this.filename;
        if (!filename) {
            filename = this.filenamePrefix;
            filename += this.generateId();
            filename += "." + this.filenameExtension;
        }
        return filename;
    }

    private generateId() {
        try {
            const id = JSON.parse(this.payload).id;
            if (!isNullOrUndefined(id))
                return id;
        } catch (exc){}
        return new IdGenerator(this.payload).generateId() + ".";
    }
}