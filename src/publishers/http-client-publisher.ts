import {Publisher} from './publisher';
import {Logger} from '../loggers/logger';
import {Container, Injectable} from 'conditional-injector';
import {PublisherModel} from '../models/inputs/publisher-model';
import {HttpAuthentication} from '../http-authentications/http-authentication';
import {HttpRequester} from '../pools/http-requester';
import {ProtocolsManager} from '../configurations/protocols-manager';

@Injectable({predicate: (publish: any) => ProtocolsManager
        .insertPublisherProtocol('http',
            ['http-client', 'https', 'https-client'])
        .matchesRatingAtLeast(publish.type, 95)})
export class HttpClientPublisher extends Publisher {

    constructor(publish: PublisherModel) {
        super(publish);
        this.method = publish.method.toUpperCase();
        this.payload = this.payload || '';
        this.headers = this.headers || {};
        this.timeout = this.timeout || 3000;
    }

    public publish(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.insertAuthentication();

            new HttpRequester(this.url,
                            this.method.toLowerCase(),
                            this.headers,
                            this.payload,
                            this.timeout)
                .request()
                .then((response: any) => {
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
