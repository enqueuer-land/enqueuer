import {Publisher} from "./publisher";
const fs = require("fs");

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