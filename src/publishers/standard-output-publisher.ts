import {Publisher} from "./publisher";
const prettyjson = require('prettyjson');

const options = {
    indent: 8,
    keysColor: "white",
    dashColor: "white"
  };

export class StandardOutputPublisher extends Publisher {

    constructor(publisherProperties: any) {
        super(publisherProperties);
    }

    public publish(): Promise<void> {
        console.log(prettyjson.render(JSON.parse(this.payload), options));
        return Promise.resolve();
    }

}