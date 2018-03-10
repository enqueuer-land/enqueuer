import {Publisher} from "./publisher";
import {Injectable} from "../injector/injector";
const fs = require("fs");

@Injectable((publishRequisition: any) => publishRequisition.type === "file")
export class FilePublisher extends Publisher {

    private filename: string;

    constructor(publisherAttributes: any) {
        super(publisherAttributes);
        this.filename = publisherAttributes.filename;
    }

    public publish(): Promise<void> {
        fs.writeFileSync(this.filename, this.payload);
        return Promise.resolve();
    }
}