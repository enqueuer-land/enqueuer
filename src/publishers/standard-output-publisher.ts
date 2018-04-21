import {Publisher} from "./publisher";
import {PublisherModel} from "../requisitions/models/publisher-model";
import {Injectable} from "conditional-injector";
const prettyjson = require('prettyjson');

const options = {
    defaultIndentation: 4,
    keysColor: "white",
    dashColor: "grey"
  };

@Injectable({predicate: (publishRequisition: any) => publishRequisition.type === "standard-output"})
export class StandardOutputPublisher extends Publisher {

    constructor(publisherProperties: PublisherModel) {
        super(publisherProperties);
    }

    public publish(): Promise<void> {
        console.log(prettyjson.render(JSON.parse(this.payload), options));
        return Promise.resolve();
    }

}