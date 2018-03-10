import {Publisher} from "./publisher";
import {Injectable} from "../injector/injector";
import {DateController} from "../dates/date-controller";
const fs = require("fs");

@Injectable((publishRequisition: any) => publishRequisition.type === "file")
export class FilePublisher extends Publisher {

    private filenamePrefix: string;

    constructor(publisherAttributes: any) {
        super(publisherAttributes);
        this.filenamePrefix = publisherAttributes.filenamePrefix;
    }

    public publish(): Promise<void> {
        fs.writeFileSync(this.filenamePrefix + new DateController().getDateOnlyNumbers(), this.payload);
        return Promise.resolve();
    }
}