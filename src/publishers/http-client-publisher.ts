import {Publisher} from './publisher';
import {Logger} from '../loggers/logger';
import {Container, Injectable} from 'conditional-injector';
import {PublisherModel} from '../models/inputs/publisher-model';
import {HttpAuthentication} from '../http-authentications/http-authentication';
import {HttpRequester} from './http-requester';

@Injectable({predicate: (publishRequisition: any) => publishRequisition.type === 'http-client' || publishRequisition.type === 'https-client'})
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

            new HttpRequester(this.url,
                            this.method.toLowerCase(),
                            this.headers,
                            this.payload)
                .request()
                .then((response: any) => {
                    Logger.trace(`Http/s requisition response: ${JSON.stringify(response)}`.substr(0, 128));
                    this.messageReceived = response;
                    resolve();
                })
                .catch(err => reject(err));
        });
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
