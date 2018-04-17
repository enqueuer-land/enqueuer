import {Publisher} from "./publisher";
import {Injectable} from "../injector/injector";
import {PublisherModel} from "../requisitions/models/publisher-model";
const net = require('net')

@Injectable((publishRequisition: any) => publishRequisition.type === "uds")
export class UdsPublisher extends Publisher {

    private path: string;

    constructor(publisherAttributes: PublisherModel) {
        super(publisherAttributes);
        this.path= publisherAttributes.path;

    }

    publish(): Promise<void> {
        return new Promise((resolve, reject) => {
            const client = net.createConnection(this.path)
                .on('connect', ()=>{
                    client.write(this.payload);
                    resolve()
                })
                .on('error', function(data: any) {
                    reject(data);
                })
        });
    }
}