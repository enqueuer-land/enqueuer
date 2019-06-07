import {Publisher} from './publisher';
import {Logger} from '../loggers/logger';
import {PublisherModel} from '../models/inputs/publisher-model';
import {HttpRequester} from '../pools/http-requester';
import {MainInstance} from '../plugins/main-instance';
import {PublisherProtocol} from '../protocols/publisher-protocol';
import {HttpAuthenticationFactory} from '../http-authentications/http-authentication-factory';

class HttpPublisher extends Publisher {

    constructor(publish: PublisherModel) {
        super(publish);
        this['method'] = publish.method || 'get';
        this.payload = this.payload || '';
        this['headers'] = this.headers || {};
        this['timeout'] = this.timeout || 3000;
    }

    public publish(): Promise<any> {
        this.insertAuthentication();

        return new HttpRequester(this.url,
            this.method.toLowerCase(),
            this.headers,
            this.payload,
            this.timeout)
            .request();
    }

    private insertAuthentication() {
        if (this.authentication) {
            const authenticator = new HttpAuthenticationFactory().create(this.authentication);
            const authentication = authenticator.generate();
            if (authentication) {
                this['headers'] = Object.assign(this.headers, authentication);
            } else {
                Logger.warning(`No http authentication method was generated from: ${this.authentication}`);
            }
        }
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    const protocol = new PublisherProtocol('http',
        (publisherModel: PublisherModel) => new HttpPublisher(publisherModel),
        ['statusCode', 'statusMessage', 'body'])
        .addAlternativeName('http-client', 'https', 'https-client')
        .setLibrary('request');

    mainInstance.protocolManager.addProtocol(protocol);
}
