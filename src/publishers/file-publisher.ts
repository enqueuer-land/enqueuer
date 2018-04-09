import {Publisher} from "./publisher";
import {Injectable} from "../injector/injector";
import {PublisherModel} from "../requisitions/models/publisher-model";
import {RequisitionIdGenerator} from "../requisitions/requisition-id-generator";
const fs = require("fs");

@Injectable((publishRequisition: any) => publishRequisition.type === "file")
export class FilePublisher extends Publisher {

    private filenamePrefix: string;

    constructor(publisherAttributes: PublisherModel) {
        super(publisherAttributes);
        this.filenamePrefix = publisherAttributes.filenamePrefix;
    }

    public publish(): Promise<void> {
        const filename = this.filenamePrefix + new RequisitionIdGenerator(this.payload).generateId() + ".json";
        fs.writeFileSync(filename, JSON.stringify(JSON.parse(this.payload), null, 2));
        return Promise.resolve();
    }
}