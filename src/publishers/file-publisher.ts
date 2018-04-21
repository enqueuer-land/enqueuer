import {Publisher} from "./publisher";
import {PublisherModel} from "../requisitions/models/publisher-model";
import {RequisitionIdGenerator} from "../requisitions/requisition-id-generator";
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
                            new RequisitionIdGenerator(this.payload).generateId() +
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