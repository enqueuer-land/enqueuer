import {Publisher} from "./publisher";
import {PublisherModel} from "../models/publisher-model";
import {IdGenerator} from "../id-generator/id-generator";
import {Injectable} from "conditional-injector";
const fs = require("fs");

@Injectable({predicate: (publishRequisition: any) => publishRequisition.type === "file"})
export class FilePublisher extends Publisher {

    private filenamePrefix: string;
    private filenameExtension: string;

    constructor(publisherAttributes: PublisherModel) {
        super(publisherAttributes);
        this.filenamePrefix = publisherAttributes.filenamePrefix;
        this.filenameExtension = publisherAttributes.filenameExtension;
    }

    public publish(): Promise<void> {
        const filename = this.filenamePrefix +
                            new IdGenerator(this.payload).generateId() +
                            "." +
                            this.filenameExtension;
        let value = this.payload;
        try {
            value = JSON.stringify(JSON.parse(this.payload), null, 2);
        } catch (exc){}

        fs.writeFileSync(filename, value);
        return Promise.resolve();
    }
}