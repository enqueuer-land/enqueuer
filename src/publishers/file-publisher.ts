import {Publisher} from "./publisher";
import {Injectable} from "../injector/injector";
import {DateController} from "../timers/date-controller";
import {PublisherModel} from "../requisitions/models/publisher-model";
const fs = require("fs");

@Injectable((publishRequisition: any) => publishRequisition.type === "file")
export class FilePublisher extends Publisher {

    private filenamePrefix: string;

    constructor(publisherAttributes: PublisherModel) {
        super(publisherAttributes);
        this.filenamePrefix = publisherAttributes.filenamePrefix;
    }

    public publish(): Promise<void> {
        const filename = this.filenamePrefix + new DateController().getStringOnlyNumbers() + ".json";
        fs.writeFileSync(filename, this.payload);
        return Promise.resolve();
    }
}