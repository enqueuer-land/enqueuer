import {Publish} from "./publish";
import {EventCallback} from "../../event-callback";

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

    execute(eventCallback: EventCallback): void {
        request.post({
                url: this.endpoint,
                body: this.payload
            },
            (error: any, response: any, body: any) =>
            {
                if (error) {
                    console.log("Error to publish http: "  + error)
                }
                else {
                    eventCallback(this);
                }
            });

    }

}
