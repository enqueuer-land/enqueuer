import {Publish} from "./publish";

const request = require("request");

export class PublishRest extends  Publish{
    endpoint: string = "";
    method: string = "";
    header: any = {};

    constructor(publish: any) {
        super(publish);
        if (publish) {
            this.endpoint = publish.endpoint;
            this.method = publish.method;
            this.header = publish.header;
        }
    }

    execute(): Promise<Publish> {
        return new Promise((resolve, reject) => {
            request.post({
                    url: this.endpoint,
                    body: this.payload
                },
                (error: any, response: any, body: any) =>
                {
                    if (error) {
                        reject("Error to publish http: "  + error);
                    }
                    else {
                        resolve(this);
                    }
                });
        })

    }

}
