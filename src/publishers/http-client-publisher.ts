import {Publisher} from './publisher';
import {Logger} from '../loggers/logger';
import {Injectable} from 'conditional-injector';
import {PublisherModel} from '../models/inputs/publisher-model';
import request from 'request';

@Injectable({predicate: (publishRequisition: any) => publishRequisition.type === 'http-client' ||  publishRequisition.type === 'https-client'})
export class HttpClientPublisher extends Publisher {
    private url: string;
    private method: string;
    private headers: any;

    constructor(publish: PublisherModel) {
        super(publish);
        this.url = publish.url;
        this.method = publish.method.toUpperCase();
        this.payload = publish.payload || '';
        this.headers = publish.headers || {};
    }

    public publish(): Promise<void> {
        return new Promise((resolve, reject) => {

            let options: any = {
                url: this.url,
                method: this.method,
                headers: this.headers
            };
            options.data = options.body = this.handleObjectPayload(options);
            if (this.method.toUpperCase() != 'GET') {
                options.headers['Content-Length'] = options.headers['Content-Length'] || this.setContentLength(options.data);
            }
            Logger.trace(`Http-client-publisher ${JSON.stringify(options)}`);
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            request(options,
                (error: any, response: any) => {
                    if (response) {
                        this.messageReceived = JSON.stringify(response);
                        Logger.trace(`Http requisition response: ${JSON.stringify(response).substr(0, 128)}...`);
                    } else {
                        Logger.warning(`No http requisition response`);
                    }

                    if (error) {
                        reject('Http request error: '  + error);
                    } else {
                        resolve();
                    }
                });
        });

    }

    private setContentLength(value: string): number {
        if (Buffer.isBuffer(value)) {
            return value.length;
        } else {
            return Buffer.from(value, 'utf8').byteLength;
        }
    }

    private handleObjectPayload(options: any): string {
        let result: any = Object.assign({}, options);
        if (this.method.toUpperCase() != 'GET') {
            try {
                const isObject = typeof JSON.parse(this.payload) === 'object';
                if (isObject) {
                    Logger.trace(`Http payload is an object: ${this.payload}`);
                    result.json = true;
                }
                return this.payload;
            }
            catch (exc) {
                //do nothing
            }
            if (typeof(this.payload) != 'string') {
                this.payload = JSON.stringify(this.payload);
            }
        }
        return this.payload;
    }
}
