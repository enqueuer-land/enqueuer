import {Publisher} from "./publisher";
const prettyjson = require('prettyjson');

const options = {
    indent: 6,
    keysColor: "white",
    dashColor: "white"
  };

export class StandardOutputPublisher extends Publisher {

    constructor(publisherProperties: any) {
        super(publisherProperties);
    }

    public publish(): Promise<void> {
        console.log(prettyjson.render(JSON.parse(JSON.stringify(this.payload)), options));
        return Promise.resolve();
    }

}