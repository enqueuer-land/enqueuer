import { Publisher } from './publisher';
import { Logger } from '../loggers/logger';
import { PublisherModel } from '../models/inputs/publisher-model';
import { HttpRequester } from '../pools/http-requester';
import { MainInstance } from '../plugins/main-instance';
import { PublisherProtocol } from '../protocols/publisher-protocol';
import { HttpAuthenticationFactory } from '../http-authentications/http-authentication-factory';

class HttpPublisher extends Publisher {
  constructor(publish: PublisherModel) {
    super(publish);
    this['method'] = publish.method || 'get';
    this.payload = this.payload || '';
    this['headers'] = this.headers || {};
    this['timeout'] = this.timeout || 3000;
  }

  public async publish(): Promise<object> {
    this.insertAuthentication();

    const response = await new HttpRequester(
      this.url,
      this.method.toLowerCase(),
      this.headers,
      this.payload,
      this.timeout
    ).request();
    this.executeHookEvent('onResponseReceived', response);
    return this.processResponseToBePrinted(response);
  }

  private processResponseToBePrinted(response: any): object {
    const toBePrinted: any = {
      statusCode: response.statusCode,
      headers: response.headers
    };
    try {
      if (response.body) {
        toBePrinted.body = JSON.parse(response.body);
      }
    } catch (e) {
      toBePrinted.body = response.body;
    }
    return toBePrinted;
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
  const protocol = new PublisherProtocol(
    'http',
    (publisherModel: PublisherModel) => new HttpPublisher(publisherModel),
    {
      description: 'The HTTP publisher provides an implementation of http requisitions',
      libraryHomepage: 'https://github.com/axios/axios',
      schema: {
        attributes: {
          url: {
            required: true,
            type: 'string',
            example: 'https://github.com/enqueuer-land/enqueuer'
          },
          method: {
            required: false,
            type: 'string',
            defaultValue: 'GET',
            listValues: ['GET', 'POST', 'PATCH', 'PUT', 'OPTIONS', 'HEAD', 'DELETE']
          },
          payload: {
            required: true,
            type: 'text'
          },
          timeout: {
            required: false,
            type: 'int',
            defaultValue: 3000,
            suffix: 'ms'
          },
          headers: {
            description: '',
            type: 'object',
            defaultValue: {}
          }
        },
        hooks: {
          onResponseReceived: {
            description: 'Hook called when the publisher gets a response from the server',
            arguments: {
              statusCode: {},
              headers: {},
              body: {}
            }
          }
        }
      }
    }
  )
    .addAlternativeName('http-client', 'https', 'https-client')
    .setLibrary('request');

  mainInstance.protocolManager.addProtocol(protocol);
}
