import { Actuator } from './actuator';
import { Logger } from '../loggers/logger';
import { ActuatorModel } from '../models/inputs/actuator-model';
import { HttpActuatorFetcher } from '../pools/http-actuator-fetcher';
import { MainInstance } from '../plugins/main-instance';
import { ActuatorProtocol } from '../protocols/actuator-protocol';
import { HttpAuthenticationFactory } from '../http-authentications/http-authentication-factory';

const DEFAULT_TIMEOUT = 5000;

class HttpActuator extends Actuator {
  constructor(model: ActuatorModel) {
    super(model);
    this['method'] = model.method || 'get';
    this.payload = this.payload || '';
    this['headers'] = this.headers || {};
    this['timeout'] = this.timeout || DEFAULT_TIMEOUT;
  }

  public async act(): Promise<object> {
    this.insertAuthentication();

    const response = await new HttpActuatorFetcher(
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
  const protocol = new ActuatorProtocol('http', (actuatorModel: ActuatorModel) => new HttpActuator(actuatorModel), {
    description: 'The HTTP actuator provides an implementation of http tasks',
    libraryHomepage: 'https://nodejs.org/dist/latest-v18.x/docs/api/globals.html',
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
          defaultValue: DEFAULT_TIMEOUT,
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
          description: 'Hook called when the actuator gets a response from the server',
          arguments: {
            statusCode: {},
            headers: {},
            body: {}
          }
        }
      }
    }
  })
    .addAlternativeName('http-client', 'https', 'https-client')
    .setLibrary('fetch');

  mainInstance.protocolManager.addProtocol(protocol);
}
