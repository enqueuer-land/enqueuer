import {Publisher} from "./publisher";
import {Injectable} from "../injector/injector";
import {PublisherModel} from "../requisitions/model/publisher-model";
const prettyjson = require('prettyjson');

const options = {
    indent: 8,
    keysColor: "white",
    dashColor: "white"
  };

@Injectable((publishRequisition: any) => publishRequisition.type === "standard-output")
export class StandardOutputPublisher extends Publisher {

    constructor(publisherProperties: PublisherModel) {
        super(publisherProperties);
    }

    public publish(): Promise<void> {
        console.log(prettyjson.render(JSON.parse(this.payload), options));
        return Promise.resolve();
    }

}