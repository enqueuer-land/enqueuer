import {Publisher} from "./publisher";
import {Injectable} from "../injector/injector";
import {PublisherModel} from "../requisitions/models/publisher-model";
import {Logger} from "../loggers/logger";

const request = require("request");

@Injectable((publishRequisition: any) => publishRequisition.type === "http-client")
export class HttpClientPublisher extends Publisher {
    private url: string;
    private method: string;
    private headers: any;

    constructor(publish: PublisherModel) {
        super(publish);
        this.url = publish.url;
        this.method = publish.method;
        this.payload = JSON.stringify(publish.payload);
        this.headers = publish.headers;

        if (this.headers['Content-Length'] == null) {
            if (Buffer.isBuffer(this.payload)) {
                this.headers["Content-Length"] = this.payload.length;
            } else {
                this.headers["Content-Length"] = Buffer.byteLength(this.payload);
            }
        }
    }

    public publish(): Promise<void> {
        return new Promise((resolve, reject) => {
            Logger.debug(`Http in ${this.url}(${this.method}) - ${this.payload}`
                .substr(0, 100).concat("..."));

            request({
                    url: this.url,
                    method: this.method,
                    headers: this.headers,
                    data: this.payload,
                    body: this.payload
                },
                (error: any, response: any, body: any) =>
                {
                    response.setEncoding(null);

                    if (error) {
                        reject("Error to publish http: "  + error);
                    }
                    else {
                        resolve();
                    }
                    Logger.debug(`Http response ${JSON.stringify(response)}`)
                    Logger.debug(`Http body ${JSON.stringify(body)}`)
                });
        })

    }
}
