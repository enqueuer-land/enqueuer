import {Publisher} from './publisher';
import {Logger} from '../loggers/logger';
import {Container, Injectable} from 'conditional-injector';
import {PublisherModel} from '../models/inputs/publisher-model';
import request from 'request';
import {HttpAuthentication} from '../http-authentications/http-authentication';

@Injectable({predicate: (publishRequisition: any) => publishRequisition.type === 'http-client' ||  publishRequisition.type === 'https-client'})
export class HttpClientPublisher extends Publisher {
    private url: string;
    private method: string;
    private headers: any;
    private authentication: any;

    constructor(publish: PublisherModel) {
        super(publish);
        this.url = publish.url;
        this.authentication = publish.authentication;
        this.method = publish.method.toUpperCase();
        this.payload = publish.payload || '';
        this.headers = publish.headers || {};
    }

    public publish(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.insertAuthentication();
            const options = this.createOptions();
            Logger.trace(`Http-client-publisher ${JSON.stringify(options)}`);
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
            request(options,
                (error: any, response: any) => {
                    this.handleResponse(response);
                    if (error) {
                        reject('Http request error: '  + error);
                    } else {
                        resolve();
                    }
                });
        });

    }

    private handleResponse(response: any) {
        if (response) {
            this.messageReceived = response;
            Logger.trace(`Http requisition response: ${JSON.stringify(response)}`.substr(0, 128));
        } else {
            Logger.warning(`No http requisition response`);
        }
    }

    private createOptions() {
        let options: any = {
            url: this.url,
            method: this.method,
            headers: this.headers
        };
        options.data = options.body = this.handleObjectPayload();
        if (this.method.toUpperCase() != 'GET') {
            options.headers['Content-Length'] = options.headers['Content-Length'] || this.setContentLength(options.data);
        }
        return options;
    }

    private setContentLength(value: string): number {
        if (Buffer.isBuffer(value)) {
            return value.length;
        } else {
            return Buffer.from(value, 'utf8').byteLength;
        }
    }

    private handleObjectPayload(): string {
        if (this.method.toUpperCase() == 'GET') {
            return this.payload;
        }
        try {
            const parsedPayload = JSON.parse(this.payload);
            if (typeof parsedPayload === 'object') {
                Logger.trace(`Http payload is an object: ${this.payload}`);
            }
            return this.payload;
        }
        catch (exc) {
            //do nothing
        }
        if (typeof(this.payload) != 'string') {
            this.payload = JSON.stringify(this.payload);
        }

        return this.payload;
    }

    private insertAuthentication() {
        if (this.authentication) {
            const authenticator = Container.subclassesOf(HttpAuthentication).create(this.authentication);
            const authentication = authenticator.generate();
            if (authentication) {
                this.headers = Object.assign(this.headers, authentication);
            } else {
                Logger.warning(`No http authentication method was generated from: ${this.authentication}`);
            }
        }
    }
}
