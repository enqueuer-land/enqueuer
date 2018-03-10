import {Publisher} from "./publisher";
import {Injectable} from "../injector/injector";
import {DateController} from "../dates/date-controller";
import {PublisherModel} from "../requisitions/model/publisher-model";
const fs = require("fs");

@Injectable((publishRequisition: any) => publishRequisition.type === "file")
export class FilePublisher extends Publisher {

    private filenamePrefix: string;

    constructor(publisherAttributes: PublisherModel) {
        super(publisherAttributes);
        this.filenamePrefix = publisherAttributes.filenamePrefix;
    }

    public publish(): Promise<void> {
        fs.writeFileSync(this.filenamePrefix + new DateController().getDateOnlyNumbers(), this.payload);
        return Promise.resolve();
    }
}